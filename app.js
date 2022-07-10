const venom = require('venom-bot');
const io = require('socket.io-client');
var _client = null; // venom-bot

// const socket = io.connect('http://localhost:5819', {
const socket = io.connect('https://app.restobar.papaya.com.pe', {         
        // forceNew: true,        
        query: {
          idorg: 'Server',
          idsede: 'SendMsj',
          isServerPrint: 0,
          isFromApp: 0,
          isServerSendMsj: 1          
        }
    });
  
// socket.on('nuevoPedido', (data) => {
//   console.log('nuevoPedido idsede', data);
//   SendMsj();
// });

socket.on('connect_error', (e) => { console.log(e);  });

socket.on('disconnect', function() {
  console.log("Socket disconnected.");
});

socket.on("connect", () => {
  console.log('Socket conectadoooo!! == ', socket.connected); // true
});

socket.on("mensaje-test-w", (val) => {
  console.log('mensaje-test-w!! == ', val); // true
  SendMsj(val);
});


socket.on('enviado-send-msj', (data) => {
  console.log('conectado idsede', data);

  // para enviar a varios telefonos si es el caso
  if (data.tipo === 0) {
    const numPhones = data.telefono.split(',');
    numPhones.map(n => {
      data.telefono = n;
      SendMsj(data);
    });
  }  else {
    SendMsj(data);
  }


    
});

// crea session
venom
  .create(
    'PapayaExpresMsj',
    undefined,
    (statusSession, session) => {
      console.log('Status Session: ', statusSession);
      //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser
      //Create session wss return "serverClose" case server for close
      console.log('Session name: ', session);
    },
    undefined,
    // statusFind
    (statusSession, session) => {
      console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
      //Create session wss return "serverClose" case server for close
      console.log('Session name: ', session);
    },
    // options
    {
      multidevice: false, // for version not multidevice use false.(default: true)
      folderNameToken: 'tokens', //folder name when saving tokens
      mkdirFolderToken: '', //folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
      headless: true, // Headless chrome
      devtools: false, // Open devtools by default
      useChrome: true, // If false will use Chromium instance
      debug: false, // Opens a debug session
      logQR: true, // Logs QR automatically in terminal
      browserWS: '', // If u want to use browserWSEndpoint
      browserArgs: [''], // Original parameters  ---Parameters to be added into the chrome browser instance
      addBrowserArgs: [''], // Add broserArgs without overwriting the project's original
      puppeteerOptions: {}, // Will be passed to puppeteer.launch
      disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
      disableWelcome: true, // Will disable the welcoming message which appears in the beginning
      updatesLog: true, // Logs info updates automatically in terminal
      autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
      createPathFileToken: false, // creates a folder when inserting an object in the client's browser, to work it is necessary to pass the parameters in the function create browserSessionToken
      chromiumVersion: '818858', // Version of the browser that will be used. Revision strings can be obtained from omahaproxy.appspot.com.
      addProxy: [''], // Add proxy server exemple : [e1.p.webshare.io:01, e1.p.webshare.io:01]
      userProxy: '', // Proxy login username
      userPass: '' // Proxy password
    },
    // BrowserSessionToken
    // To receive the client's token use the function await clinet.getSessionTokenBrowser()
    {
      WABrowserId: '"UnXjH....."',
      WASecretBundle:
        '{"key":"+i/nRgWJ....","encKey":"kGdMR5t....","macKey":"+i/nRgW...."}',
      WAToken1: '"0i8...."',
      WAToken2: '"1@lPpzwC...."'
    },
    // BrowserInstance
    (browser, waPage) => {
      console.log('Browser PID:', browser.process().pid);
      waPage.screenshot({ path: 'screenshot.png' });
    }
  )
  .then((client) => {
    console.log('client', 'true');
    start(client);
    // client = client;
  })
  .catch((erro) => {
    console.log('erro', erro);
  });


  function start(client) {        
    _client = client;
    // console.log('client', client);
  }
  
  // .sendText('51960518915@c.us', msj'👋 Tiene un nuevo pedido chequealo =====>')

  async function SendMsj(dataMsj) {    
    if ( !_client ) { console.log('not _client', _client); return; }
    if ( !dataMsj.telefono ) {return; }
    if ( dataMsj.telefono.length < 9 ) {return; }

    dataMsj.telefono = dataMsj.telefono.replace(/ /g, '');
    dataMsj.telefono = dataMsj.telefono.replace(/\+/g, '');
    const numberPhone = dataMsj.telefono.length === 9 ? `51${dataMsj.telefono}@c.us` : `${dataMsj.telefono}@c.us`;

    if (dataMsj.tipo === 0) { // quitamos el # hastag de la url // mientras actualize servidor
        dataMsj.msj = dataMsj.msj.replace('#/', '');
    }
    
    if (dataMsj.tipo === 3) { // envia comprobante pdf comprobante
      
      // pdf
      await _client
      .sendFile(
        numberPhone,
        dataMsj.url_comprobante,
        dataMsj.nombre_file,
        'Ver archivo en pdf'
      )
      .then((result) => {
        console.log('Result: ', result); //return object success

      })
      .catch((erro) => {
        console.error('Error when sending: ', erro); //return object error
      });

      // xml
      await _client
      .sendFile(
        numberPhone,
        dataMsj.url_comprobante_xml,
        dataMsj.nombre_file,
        'Ver archivo en xml'
      )
      .then((result) => {
        console.log('Result: ', result); //return object success

      })
      .catch((erro) => {
        console.error('Error when sending: ', erro); //return object error
      });

      // return;
    }

    await _client
      .sendText(numberPhone, dataMsj.msj)
      .then((result) => {
        console.log('Result: ', result); //return object success

        // ok verificacion de telfono
        if ( dataMsj.tipo === 1 ) {
          dataMsj.msj = true;
          socket.emit('mensaje-verificacion-telefono-rpt', dataMsj);
        }
      })
      .catch((erro) => {
        console.error('Error when sending: ', erro); //return object error

        // error verificacion de telfono
        if ( dataMsj.tipo === 1 ) {
          dataMsj.msj = false;
          socket.emit('mensaje-verificacion-telefono-rpt', dataMsj);
        }

      });
  }