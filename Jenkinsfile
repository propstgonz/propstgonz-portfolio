// Retags the last known-good image back to :latest and redeploys it
// without rebuilding. Shared by the Deploy and Health check stages so
// any failure after the snapshot — `docker compose up` erroring outright,
// or the container starting and then crashing — recovers the same way.
def attemptRollback() {
  def hasRollback = sh(
    script: "docker image inspect ${env.IMAGE_NAME}:rollback > /dev/null 2>&1",
    returnStatus: true
  ) == 0

  if (hasRollback) {
    sh """
      docker tag ${env.IMAGE_NAME}:rollback ${env.IMAGE_NAME}:latest
      docker compose up -d --no-build --remove-orphans
    """
    echo "Rolled back to the previous working image."
  } else {
    echo 'No previous image to roll back to (looks like the first deploy on this host) — the site may be down, manual intervention needed.'
  }
}

pipeline {
  agent any

  options {
    // Two build attempts at up to 10 minutes each, plus checkout/deploy/
    // health check overhead — 25 minutes leaves real margin instead of
    // the pipeline racing its own retry budget.
    timeout(time: 25, unit: 'MINUTES')
    disableConcurrentBuilds()
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    // Matches docker-compose.yml's `image:` — a fixed tag rather than
    // Compose's directory-derived default, so rollback can reliably
    // retag "the previous image" regardless of the Jenkins workspace path.
    IMAGE_NAME = 'propstgonz-web'
  }

  stages {

    stage('Checkout') {
      steps {
        sh 'git config --global --add safe.directory ${WORKSPACE}'
        checkout scm
        script {
          env.GIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        }
        echo "Building commit: ${env.GIT_SHA}"
      }
    }

    stage('Preflight') {
      steps {
        sh '''
          docker info > /dev/null || (echo "Docker daemon unreachable from this agent." && exit 1)
          test -f .env || (echo ".env is missing in the workspace — docker-compose.yml requires it (env_file: .env)." && exit 1)
          docker compose config -q

          # The click counter (src/pages/api/counter.ts) writes its JSON
          # file here through the bind mount in docker-compose.yml.
          # Created up front, every deploy, so a missing host directory
          # can never silently break the counter the way it used to.
          mkdir -p /media/raid/database/portfolio-counter
        '''
      }
    }

    stage('Snapshot previous image') {
      steps {
        script {
          def hasPrevious = sh(
            script: "docker image inspect ${env.IMAGE_NAME}:latest > /dev/null 2>&1",
            returnStatus: true
          ) == 0

          if (hasPrevious) {
            sh "docker tag ${env.IMAGE_NAME}:latest ${env.IMAGE_NAME}:rollback"
            echo "Snapshotted current ${env.IMAGE_NAME}:latest as :rollback before building."
          } else {
            echo "No existing ${env.IMAGE_NAME}:latest image found — nothing to snapshot (first deploy on this host?)."
          }
        }
      }
    }

    stage('Build') {
      steps {
        // A flaky base-image pull or registry hiccup shouldn't fail an
        // otherwise-good deploy outright — retry once before giving up.
        retry(2) {
          timeout(time: 10, unit: 'MINUTES') {
            sh 'docker compose build --no-cache --pull'
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        script {
          try {
            sh 'docker compose up -d --remove-orphans'
          } catch (err) {
            echo "docker compose up failed outright: ${err}"
            sh 'docker compose logs --tail=150 propstgonz-web || true'
            attemptRollback()
            error("Deploy command failed for ${env.GIT_SHA} — rolled back if a previous image was available.")
          }
        }
      }
    }

    stage('Health check') {
      steps {
        script {
          def containerUp = false
          def healthy = false

          for (int i = 1; i <= 6; i++) {
            containerUp = sh(
              script: "docker inspect -f '{{.State.Running}}' propstgonz-web 2>/dev/null || echo false",
              returnStdout: true
            ).trim() == 'true'

            if (!containerUp) {
              echo "Attempt ${i}/6: container propstgonz-web is not running."
              break
            }

            // Runs inside the propstgonz-web container itself via
            // `docker exec` rather than curling localhost:4321 from this
            // agent — Jenkins itself commonly runs containerized (its own
            // "localhost" is not the host's), so a plain curl here would
            // never reach the published port regardless of how healthy
            // the deploy actually is. `docker exec` always works: it goes
            // through the same Docker socket already used for every other
            // `docker` command in this pipeline.
            def ok = sh(
              script: "docker exec propstgonz-web wget -q -O /dev/null -T 5 http://127.0.0.1:4321/",
              returnStatus: true
            ) == 0
            def code = ok ? '200' : '000'

            if (ok) {
              healthy = true
              echo "Health check passed on attempt ${i}."
              break
            }

            echo "Attempt ${i}/6: HTTP ${code} — retrying in 5s..."
            sleep(time: 5, unit: 'SECONDS')
          }

          if (!containerUp) {
            // Real failure: the new image built fine but the app itself
            // died on startup (bad env var, crash on boot, etc). This is
            // exactly the case a slow-cold-start health check must NOT be
            // confused with — the container isn't just slow, it's gone.
            echo 'Container exited after deploy — attempting automatic rollback.'
            sh 'docker compose logs --tail=150 propstgonz-web || true'
            attemptRollback()
            error("Deploy of ${env.GIT_SHA} crashed the container after starting — see logs above.")
          }

          if (!healthy) {
            // Informational only — a slow cold start or a flaky health
            // check should never fail a deploy that otherwise succeeded.
            // The container is confirmed running at this point; it's
            // just not confirmed to be answering HTTP yet.
            echo 'Container is running but never returned HTTP 200 within 30s — check `docker compose logs propstgonz-web` on the host. Not failing the build over this.'
            sh 'docker compose logs --tail=80 propstgonz-web || true'
          }
        }
      }
    }
  }

  post {
    always {
      // Only removes dangling (untagged) layers — :latest and :rollback
      // are both tagged, so this never deletes the rollback candidate.
      sh 'docker image prune -f --filter "dangling=true" || true'
    }
    success {
      echo "Frontend deployed — commit ${env.GIT_SHA}."
    }
    failure {
      echo 'Build failed, or the deploy crashed and was rolled back — see the failed stage above for details.'
    }
  }
}
