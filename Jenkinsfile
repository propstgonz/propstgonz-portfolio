pipeline {
  agent any

  options {
    timeout(time: 15, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  stages {

    stage('Checkout') {
      steps {
        sh 'git config --global --add safe.directory ${WORKSPACE}'
        checkout scm
        echo "Building commit: ${GIT_COMMIT[0..6]}"
      }
    }

    stage('Build') {
      steps {
        sh 'docker compose build --no-cache --pull'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose up -d --remove-orphans'
      }
    }

    stage('Health check') {
      steps {
        sleep(time: 10, unit: 'SECONDS')
        sh 'curl -sf http://localhost:4321/ > /dev/null || (echo "Health check failed" && exit 1)'
      }
    }

    stage('Cleanup') {
      steps {
        sh 'docker image prune -f --filter "dangling=true"'
      }
    }
  }

  post {
    success { echo "✅ Frontend deployed." }
    failure { echo "❌ Frontend deployment failed — previous container still running." }
  }
}
