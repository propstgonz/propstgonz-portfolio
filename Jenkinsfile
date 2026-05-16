pipeline {
  agent any

  options {
    skipDefaultCheckout()
  }

  stages {
    stage('Checkout') {
      steps {
        deleteDir()
        sh 'git config --global --add safe.directory "$WORKSPACE"'
        echo 'Checking out code...'
        checkout scm
        sh 'cp /var/jenkins_home/envs/propstgonz-portfolio/.env .env'
      }
    }

    stage('Stop Previous Deployment') {
      steps {
        script {
          echo 'Stopping previous deployment if exists...'
          sh 'docker-compose down || true'
        }
      }
    }

    stage('Recreate web container') {
      steps {
        sh '''
          sudo docker compose up -d --build
        '''
      }
    }

      stage('Verify Deployment') {
      steps {
        script {
          echo 'Verifying deployment...'
          sh '''
            sleep 5
            docker-compose ps
            docker-compose logs --tail=50
          '''
        }
      }
      }
      stage('Cleanup') {
      steps {
        script {
          echo '🧹 Cleaning up local images...'
          sh 'docker system prune -f'
          echo 'Cleanup completed'
        }
      }
      }
  }

  post {
    success {
      echo 'Deployment completed successfully.'
    }
    failure {
      echo 'Deployment failed.'
    }
  }
}
