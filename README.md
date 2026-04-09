# 🩸 FluxoMeu

Um aplicativo minimalista e intuitivo para acompanhamento do ciclo menstrual. O aplicativo utiliza o armazenamento local do dispositivo do usuário para armazenar as informações. Sem telemetria, sem coleta de dados, sem propagandas. Focamos apenas na utiidade. 

## 🛠️ Tecnologias Utilizadas

    React Native
    Expo
    React Native Calendars
    AsyncStorage (Armazenamento local persistente)
    React Native SVG

## 🚀 Como rodar o projeto na sua máquina

Para rodar este projeto, você só precisa do Node.js instalado no seu computador e do aplicativo Expo Go no seu celular (Ios ou Android) ou via Web.

### Pré-requisitos

1. [Node.js](https://nodejs.org/) (versão 18 ou superior)
2. App **Expo Go** instalado no seu celular
3. Celular e computador conectados na **mesma rede Wi-Fi** para validar o funcionamento da App.

### Instalação e Execução

1. Clone este repositório:
   ```bash
   git clone [https://github.com/paulodsneto/FluxoMeu](https://github.com/paulodsneto/FluxoMeu)

2. Entre na pasta do projeto: 
    cd FluxoMeu

3. Instale as dependências definidas no package.json: 
    npm install 

4. Inicie o servidor do Expo limpando o cache para minimizar a chance de ocorrer problemas:
    npx expo start -c

5. Abra o aplicativo da câmera no seu iPhone (ou o app do Expo Go no Android) e leia o QR Code que aparecerá no terminal. O app deve abrir normalmente. Caso não seja possível utilizar o celular use a versão Web apertando 'w' no terminal após iniciar o servidor do Expo.

#### To do

>Lógica de predição 28 dias pra frente do dia inputado pelo usuário (janela de fertilidade)

>Lógica para marcar o dia que houve relação sexual