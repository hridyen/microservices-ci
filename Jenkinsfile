pipeline {
    agent { label 'ubuntu-agent' }

    environment {
        IMAGE_NAME = "microservice"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/hridyen/microservices-ci.git'
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    def changes = sh(
                        script: "git diff origin/main...HEAD --name-only",
                        returnStdout: true
                    ).trim()

                    echo "Changes: ${changes}"

                    env.AUTH_CHANGED   = changes.contains("auth-service") ? "true" : "false"
                    env.CONFIG_CHANGED = changes.contains("config-service") ? "true" : "false"
                    env.LOGIN_CHANGED  = changes.contains("login-service") ? "true" : "false"
                }
            }
        }

        stage('Build Services') {
            parallel {

                stage('Auth Service') {
                    when { expression { env.AUTH_CHANGED == "true" } }
                    steps {
                        echo "Building AUTH..."
                        sh 'cd auth-service && docker build -t auth-service .'
                    }
                }

                stage('Config Service') {
                    when { expression { env.CONFIG_CHANGED == "true" } }
                    steps {
                        echo "Building CONFIG..."
                        sh 'cd config-service && docker build -t config-service .'
                    }
                }

                stage('Login Service') {
                    when { expression { env.LOGIN_CHANGED == "true" } }
                    steps {
                        echo "Building LOGIN..."
                        sh 'cd login-service && docker build -t login-service .'
                    }
                }
            }
        }

        stage('Run Containers') {
            steps {
                script {

                    if (env.AUTH_CHANGED == "true") {
                        sh '''
                        docker rm -f auth-container || true
                        docker run -d -p 3001:3001 --name auth-container auth-service
                        '''
                    }

                    if (env.CONFIG_CHANGED == "true") {
                        sh '''
                        docker rm -f config-container || true
                        docker run -d -p 3002:3002 --name config-container config-service
                        '''
                    }

                    if (env.LOGIN_CHANGED == "true") {
                        sh '''
                        docker rm -f login-container || true
                        docker run -d -p 3003:3003 --name login-container login-service
                        '''
                    }
                }
            }
        }
    }
}