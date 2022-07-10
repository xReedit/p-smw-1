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
    undefined
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