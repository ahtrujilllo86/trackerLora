let map;
let InforObj = [];
let marcas = [];
let centerCords = {
    lat: 18.087977,
    lng: -96.119568
};
// called when a message arrives
function onMessageArrived(message) {
  if (message.payloadString !== '') {
    const marcador = JSON.parse(message.payloadString);
    const id = message.destinationName;
    if (marcas.length > 0) {
      marcas.forEach(marcador => {
        if (marcador.id == id) {
          const latlng = new google.maps.LatLng(marcador.lat, marcador.lon);
          marcador.marker.setPosition(latlng);
        }
      });
    }
    addMarker(marcador.lat, marcador.lon, marcador.time, message.destinationName);
  }
}

function addMarker(lat, lon, time, id) {
    const marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lon),
        map: map,
        icon: 'src/images/moto.png',
        // animation: google.maps.Animation.DROP,
    });
    marcas.push(
      {
        id,
        marker,
      }
      
    );
     const infowindow = new google.maps.InfoWindow({
      content: "<h2>"+ id + "</h2><a href=https://maps.google.com/?q="+ lat + "," + lon + "><h1>Rastrear</h1></a><h2>Ultima actualizacion:<br>" + time + "</h2>"
     });
  
    marker.addListener('click', () => {
        closeOtherInfo();
        infowindow.open({
          anchor: marker,
          map,
        });
        InforObj[0] = infowindow;
    });
  // map.addListener('click', (event) => {
  //   const latitude = event.latLng.lat();
  //   const longitude = event.latLng.lng();
  //   console.log(latitude + ', ' + longitude);
  //   const radius = new google.maps.Circle({map: map,
  //     radius: 100,
  //     center: event.latLng,
  //     fillColor: '#777',
  //     fillOpacity: 0.1,
  //     strokeColor: '#AA0000',
  //     strokeOpacity: 0.8,
  //     strokeWeight: 2,
  //     draggable: true,    // Dragable
  //     editable: true      // Resizable
  // });
  // // Center of map
  // map.panTo(new google.maps.LatLng(latitude,longitude));
  // })
}

function closeOtherInfo() {
    if (InforObj.length > 0) {
      InforObj[0].set("marker", null);
      InforObj[0].close();
      InforObj.length = 0;
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: centerCords,
    });
    mqtt();
}

function mqtt() {
    // Create a client instance
    const client = new Paho.MQTT.Client('wss://broker.emqx.io', 8084, "localizador" + new Date());
    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({onSuccess:onConnect});
    // called when the client connects
    function onConnect() {
      console.log("ok...");
      client.subscribe("1000000002/#");
      //send a message optional
      // const message = new Paho.MQTT.Message("Hello");
      // message.destinationName = "World";
      // client.send(message);
    }

    function onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:"+responseObject.errorMessage);
      }
    }
}
