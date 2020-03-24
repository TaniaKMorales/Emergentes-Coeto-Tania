

// Los valores que puede tener cada celda del laberinto
var CRETA_MURO = 1;
var CRETA_LIBRE = 2;
var CRETA_SALIDA = 3;
var CRETA_META = 4;
var CRETA_PUNTOMUERTO = 5;

// Las cuatro direcciones para moverse
var CRETA_ARRIBA = 0;
var CRETA_ABAJO = 1;
var CRETA_IZQUIERDA = 2;
var CRETA_DERECHA = 3;

// Cuánto modificar el tamaño de la zona de dibujo
var PasoCambioTamano = 16;

// El tamaño de cada celda
var TamanoCelda = 16;

// El tiempo de espera en milisegundos al mostrar pasos de la solución
var TiempoEspera = 50;

//---------------------------------
// Variables globales
//---------------------------------

// Los elementos HTML
var BotonReiniciar;
var BotonGenerar;
var BotonResolver;
var BotonMostrar;
var BotonCompleta;
var BotonRestaurar;
var BotonDemo;
var BotonParar;
var BotonAncho;
var BotonEstrecho;
var BotonAlto;
var BotonBajo;
var CanvasDibujo;
var Contexto;
var BotonHistoria;
var BotonCreditos;
var BotonLicencia;
var BotonDescarga;
var BotonTecnicas;
var BotonCerrar1;
var BotonCerrar2;
var BotonCerrar3;
var BotonCerrar4;
var BotonCerrar5;
var DivPantallaCompleta;
var DivHistoria;
var DivCreditos;
var DivLicencia;
var DivDescarga;
var DivTecnicas;
var ImagenMuro;
var ImagenInfo;
var ImagenSalida;
var ImagenMeta;
var ImagenPaso;
var ImagenPuntoMuerto;

// El laberinto
var Laberinto = [];

// Valores máximos de filas y columnas
var MaxFil;
var MaxCol;

// Cuántas celdas tenemos en total
var TotalCeldas;

// Los manejadores de los temporizadores
var Temporizador = [];
var TemporizadorDemo;

// Tamaño de la zona de dibujo antes de pasar a pantalla completa
var AntiguaAnchura
var AntiguaAltura

// Origen de la zona de dibujo
var OrigenX;
var OrigenY;

// El array de las direcciones
var Direccion = [CRETA_ARRIBA, CRETA_ABAJO, CRETA_IZQUIERDA, CRETA_DERECHA];

//---------------------------------
// Funciones
//---------------------------------

//--------------------------------------------------------------
// Reiniciar el sistema de dibujo
function Reiniciar()
  {
  // Anulamos todos los temporizadores
  for ( var i=0; i<Temporizador.length; i++ )
    { clearTimeout (Temporizador[i]); }
  clearTimeout (TemporizadorDemo);

  // Obtenemos el contexto de la zona para dibujar
  Contexto = CanvasDibujo.getContext("2d");

  // Dimensiones de la zona para dibujar
  var Anchura = Contexto.canvas.clientWidth;
  var Altura = Contexto.canvas.clientHeight;

  // Borramos la zona para dibujar
  Contexto.fillStyle = "#000";
  Contexto.fillRect (0, 0, Anchura, Altura);

  // Calculamos las filas y columnas que caben en la zona de dibujo
  MaxFil = Math.floor (Altura/TamanoCelda);
  MaxCol = Math.floor (Anchura/TamanoCelda);

  // Obligamos a los dos números a que sean impares porque
  // los bordes serán muros
  if ( MaxFil % 2 == 1 )
    { OrigenY = 5; }
  else
    {
    OrigenY = 5 + TamanoCelda/2;
    MaxFil--;
    }
  if ( MaxCol % 2 == 1 )
    { OrigenX = 5; }
  else
    {
    OrigenX = 5 + TamanoCelda/2;
    MaxCol--;
    }

  // Reiniciamos el laberinto
  Laberinto = [];

  // Calculamos cuántas celdas tenemos
  TotalCeldas = MaxFil * MaxCol;

  // Recorremos todas las celdas, les damos valor de muro y las dibujamos
  var i=0;
  for ( var Fil=0 ; Fil<MaxFil ; Fil++ )
    {
    for ( var Col=0 ; Col<MaxCol ; Col++ , i++ )
      {
      Pinta (Fil, Col, ImagenMuro);
      Laberinto.push (CRETA_MURO);
      }
    }

  // Cambiamos el estado de los botones
  BotonGenerar.disabled = false;
  BotonResolver.disabled = true;
  BotonMostrar.disabled = true;
  BotonDemo.disabled = false;
  }

//--------------------------------------------------------------
// Pinta una celda con una imagen
function Pinta (Fil, Col, Imagen)
  {
  Contexto.drawImage (Imagen, OrigenX+TamanoCelda*Col, OrigenY+TamanoCelda*Fil);
  }

//--------------------------------------------------------------
// Borra una celda
function Borra (Fil, Col)
  {
  Contexto.fillRect (OrigenX+TamanoCelda*Col, OrigenY+TamanoCelda*Fil,
                     TamanoCelda, TamanoCelda);
  }

//--------------------------------------------------------------
// Genera un laberinto por backtracking
// http://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking.html
function Generar()
  {
  // Eliminamos todas las celdas que no pueden ser muros
  for ( var Fil=1 ; Fil<MaxFil ; Fil += 2 )
    {
    for ( var Col=1 ; Col<MaxCol ; Col +=2 )
      {
      Borra (Fil, Col);
      Laberinto[Fil*MaxCol+Col] = CRETA_LIBRE;
      }
    }

  // Un laberinto auxiliar
  var LabAux = [];

  // La lista de las celdas que vamos visitando
  var ListaCeldas = [];

  // Marcamos todas las celdas como rodeadas de muros
  for ( var i=0 ; i<TotalCeldas ; i++ )
    { LabAux.push (CRETA_MURO); }

  // Elegimos una celda vacía cualquiera
  Fil = 2 * Aleatorio ((MaxFil-1)/2) + 1;
  Col = 2 * Aleatorio ((MaxCol-1)/2) + 1;
  Celda = Fil * MaxCol + Col;

  // La anotamos en la lista
  ListaCeldas.push (Celda);

  // Bucle principal del algoritmo de backtracking
  var NuevaFil = 0;
  var NuevaCol = 0;
  var NuevaCelda = 0;
  var MediaFil = 0;
  var MediaCol = 0;
  var MediaCelda = 0;
  var Sigue = true;
  while ( Sigue )
    {
    // Revolvemos las direcciones
    Revuelve (Direccion);

    // Tenemos que buscar la celda a la que saltar
    var SaltoPreparado = false;

    // Intentamos saltar en cualquiera de las cuatro direcciones
    for ( var j=0 ; j<4 && !SaltoPreparado ; j++ )
      {
      switch ( Direccion[j] )
        {
        case CRETA_ARRIBA:
          MoverX = 0;
          MoverY = -2;
          break;
        case CRETA_ABAJO:
          MoverX = 0;
          MoverY = 2;
          break;
        case CRETA_IZQUIERDA:
          MoverX = -2;
          MoverY = 0;
          break;
        case CRETA_DERECHA:
          MoverX = 2;
          MoverY = 0;
          break;
        }

      // Vemos cuál podría ser la próxima celda
      NuevaFil = Fil+MoverY;
      NuevaCol = Col+MoverX;
      NuevaCelda = NuevaFil * MaxCol + NuevaCol;
      MediaFil = (Fil+NuevaFil)/2;
      MediaCol = (Col+NuevaCol)/2;
      MediaCelda = MediaFil * MaxCol + MediaCol;

      // Si la nueva celda es válida, no la hemos visitado
      // y tiene muros todo alrededor
      if ( NuevaFil >= 0 && NuevaFil<MaxFil &&
           NuevaCol >= 0 && NuevaCol<MaxCol &&
           ListaCeldas.indexOf (NuevaCelda) < 0 &&
           LabAux[NuevaCelda] == CRETA_MURO )
        {
        // Eliminamos el muro que las separa
        Borra (MediaFil, MediaCol);
        Laberinto[MediaCelda] = CRETA_LIBRE;

        // Saltamos a ella
        SaltoPreparado = true;
        ListaCeldas.push (NuevaCelda);
        Fil = NuevaFil;
        Col = NuevaCol;
        Celda = NuevaCelda;
        LabAux[Celda] = CRETA_LIBRE;
        }
      }

    // Si no hemos podido saltar en ninguna de las direcciones
    if ( !SaltoPreparado )
      {
      // Eliminamos el último salto y lo volvemos a intentar
      Celda = ListaCeldas.pop();
      var Lugar = Posicion (Celda);
      Fil = Lugar[0];
      Col = Lugar[1];

      // Si la lista está vacía es que ya hemos llegado a donde empezamos
      if ( ListaCeldas.length == 0 )
        { Sigue = false; }
      }
    }

  // Marcamos la salida y la meta
  SeleccionaSalida();
  SeleccionaMeta();

  // Cambiamos el estado de los botones
  BotonGenerar.disabled = true;
  BotonResolver.disabled = false;
  BotonMostrar.disabled = true;
  }

//--------------------------------------------------------------
// Selecciona una celda para que sea la salida
function SeleccionaSalida()
  {
  var Encontrado = false;

  while ( !Encontrado )
    {
    if ( MaxCol >= MaxFil )
      {
      Col = 0;
      Fil = 1 + Aleatorio (MaxFil-1);
      ColSig = 1;
      FilSig = Fil;
      Celda = Fil * MaxCol + Col;
      CeldaSig = FilSig * MaxCol + ColSig;
      if ( Laberinto[CeldaSig] == CRETA_LIBRE )
        { Encontrado = true; }
      }
    else
      {
      Fil = 0;
      Col = 1 + Aleatorio (MaxCol-1);
      ColSig = Col;
      FilSig = 1;
      Celda = Fil * MaxCol + Col;
      CeldaSig = FilSig * MaxCol + ColSig;
      if ( Laberinto[CeldaSig] == CRETA_LIBRE )
        { Encontrado = true; }
      }
    }

  Borra (Fil, Col);
  Pinta (Fil, Col, ImagenSalida);
  Laberinto[CeldaSig] = CRETA_SALIDA;
  }

//--------------------------------------------------------------
// Selecciona una celda para que sea la meta
function SeleccionaMeta()
  {
  var Encontrado = false;

  while ( !Encontrado )
    {
    if ( MaxCol >= MaxFil )
      {
      Col = MaxCol-1;
      Fil = 1 + Aleatorio (MaxFil-1);
      ColSig = MaxCol-2;
      FilSig = Fil;
      Celda = Fil * MaxCol + Col;
      CeldaSig = FilSig * MaxCol + ColSig;
      if ( Laberinto[CeldaSig] == CRETA_LIBRE )
        { Encontrado = true; }
      }
    else
      {
      Fil = MaxFil-1;
      Col = 1 + Aleatorio (MaxCol-1);
      ColSig = Col;
      FilSig = MaxFil-2;
      Celda = Fil * MaxCol + Col;
      CeldaSig = FilSig * MaxCol + ColSig;
      if ( Laberinto[CeldaSig] == CRETA_LIBRE )
        { Encontrado = true; }
      }
    }

  Borra (Fil, Col);
  Pinta (Fil, Col, ImagenMeta);
  Laberinto[CeldaSig] = CRETA_META;
  }

//--------------------------------------------------------------
// Resuelve el laberinto buscando los puntos muertos
function Resolver()
  {
  // Eliminamos todos los puntos muertos
  var QuedanPuntosMuertos = true;
  while ( QuedanPuntosMuertos )
    {
    // En cada iteración vemos cuántos cambios hemos conseguido
    var Cambios = 0;
    for ( var Fil=1 ; Fil<MaxFil-1 ; Fil++ )
      {
      for ( var Col=1 ; Col<MaxCol-1 ; Col++ )
        {
        Celda = Fil * MaxCol + Col;
        if ( Laberinto[Celda] == CRETA_LIBRE )
          {
          CeldaArriba = (Fil-1) * MaxCol + Col;
          CeldaAbajo = (Fil+1) * MaxCol + Col;
          CeldaIzquierda = Fil * MaxCol + Col-1;
          CeldaDerecha = Fil * MaxCol + Col+1;
          TotalMuros = 0;
          if ( Laberinto[CeldaArriba] == CRETA_MURO ||
               Laberinto[CeldaArriba] == CRETA_PUNTOMUERTO )
            { TotalMuros++; }
          if ( Laberinto[CeldaAbajo] == CRETA_MURO  ||
               Laberinto[CeldaAbajo] == CRETA_PUNTOMUERTO)
            { TotalMuros++; }
          if ( Laberinto[CeldaIzquierda] == CRETA_MURO  ||
               Laberinto[CeldaIzquierda] == CRETA_PUNTOMUERTO)
            { TotalMuros++; }
          if ( Laberinto[CeldaDerecha] == CRETA_MURO  ||
               Laberinto[CeldaDerecha] == CRETA_PUNTOMUERTO)
            { TotalMuros++; }
          if ( TotalMuros == 3 )
            {
            // Cambiamos el estado de la celda
            Pinta (Fil, Col, ImagenPuntoMuerto);
            Laberinto[Celda] = CRETA_PUNTOMUERTO;
            Cambios++;
            }
          }
        }
      }
    // Si no hemos conseguido hacer ningún cambio es que no quedan
    // puntos muertos
    if ( Cambios == 0 )
      { QuedanPuntosMuertos = false; }
    }

  // Pintamos los puntos que quedan como pasos de la solución
  for ( var Fil=1 ; Fil<MaxFil-1 ; Fil++ )
    {
    for ( var Col=1 ; Col<MaxCol-1 ; Col++ )
      {
      Celda = Fil * MaxCol + Col;
      if ( Laberinto[Celda] == CRETA_LIBRE ||
           Laberinto[Celda] == CRETA_SALIDA ||
           Laberinto[Celda] == CRETA_META )
        { Pinta (Fil, Col, ImagenPaso); }
      }
    }

  // Cambiamos el estado de los botones
  BotonGenerar.disabled = true;
  BotonResolver.disabled = true;
  BotonMostrar.disabled = false;
  }

//--------------------------------------------------------------
// Muestra la solución del laberinto y devuelve cuántos pasos necesita
function Mostrar()
  {
  // Cambiamos el estado de los botones
  BotonMostrar.disabled = true;

  // Reiniciamos los temporizadores
  Temporizador = [];

  // Redibujamos el laberinto
  var Celda;
  for ( var Fil=1 ; Fil<MaxFil-1 ; Fil++ )
    {
    for ( var Col=1 ; Col<MaxCol-1 ; Col++ )
      {
      Celda = Fil * MaxCol + Col;
      if ( Laberinto[Celda] == CRETA_LIBRE ||
           Laberinto[Celda] == CRETA_PUNTOMUERTO ||
           Laberinto[Celda] == CRETA_SALIDA ||
           Laberinto[Celda] == CRETA_META )
        { Borra (Fil, Col); }
      }
    }

  // El color para mostrar el camino
  var Color = '#0C0';
  Contexto.fillStyle = Color;
  Contexto.strokeStyle = Color;

  // Buscamos el punto de salida
  Celda = 0;
  var Encontrado = false;
  for ( var i=0 ; i<TotalCeldas && !Encontrado; i++ )
    {
    if ( Laberinto[i] == CRETA_SALIDA )
      {
      Celda = i;
      Encontrado = true;
      }
    }
  var Lugar = Posicion (Celda);
  Fil = Lugar[0];
  Col = Lugar[1];

  // Marcamos el punto de salida con un circulito
  Circulo (Fil, Col);

  // Marcamos esta celda como ya usada
  Laberinto[Celda] = CRETA_MURO;

  // Marcamos el camino hasta la meta
  var SigueCaminando = true;
  var Paso = 1;
  var NuevaFil, NuevaCol, NuevaCelda, Anchura, Altura, MinFil, MinCol;
  while ( SigueCaminando )
    {
    // Buscamos la celda para el siguiente paso
    if ( Laberinto[Celda+1] == CRETA_LIBRE ||
         Laberinto[Celda+1] == CRETA_META )
      { NuevaCelda = Celda+1; }
    else if ( Laberinto[Celda-1] == CRETA_LIBRE ||
              Laberinto[Celda-1] == CRETA_META )
      { NuevaCelda = Celda-1; }
    else if ( Laberinto[Celda+MaxCol] == CRETA_LIBRE ||
              Laberinto[Celda+MaxCol] == CRETA_META )
      { NuevaCelda = Celda+MaxCol; }
    else if ( Laberinto[Celda-MaxCol] == CRETA_LIBRE ||
              Laberinto[Celda-MaxCol] == CRETA_META )
      { NuevaCelda = Celda-MaxCol; }

    // Vemos cuál es la posición de la siguiente celda
    Lugar = Posicion (NuevaCelda);
    NuevaFil = Lugar[0];
    NuevaCol = Lugar[1];

    // Pintamos el camino de una a otra celda
    if ( Fil == NuevaFil )
      {
      Anchura = 22;
      Altura = 6;
      }
    else
      {
      Anchura = 6;
      Altura = 22;
      }
    MinFil = Math.min (Fil, NuevaFil);
    MinCol = Math.min (Col, NuevaCol);
    PosicionX = OrigenX + TamanoCelda * MinCol + 5;
    PosicionY = OrigenY + TamanoCelda * MinFil + 5;
    // Temporizamos que se pinte un rectángulo que una las dos celdas
    Temporizador.push (setTimeout (Rectangulo, Paso*TiempoEspera,
                                   PosicionX, PosicionY, Anchura, Altura));

    // Marcamos la celda anterior como ya usada
    Laberinto[Celda] = CRETA_MURO;

    // Nos pasamos a la nueva celda
    Celda = NuevaCelda;
    Fil = NuevaFil;
    Col = NuevaCol;
    Paso++;

    // Si hemos llegado a la meta, hemos terminado el camino
    if ( Laberinto[Celda] == CRETA_META )
      { SigueCaminando = false;  }
    }

  // Marcamos el punto de meta con un circulito
  Temporizador.push (setTimeout (Circulo, Paso*TiempoEspera, Fil, Col));

  // Devolmenos el total de pasos que hemos necesitado
  return (Paso);
  }

//--------------------------------------------------------------
// Dibuja un rectángulo que une dos celdas
function Rectangulo (PosicionX, PosicionY, Anchura, Altura)
  { Contexto.fillRect (PosicionX, PosicionY, Anchura, Altura); }

//--------------------------------------------------------------
// Dibuja un círculo en una celda
function Circulo (Fil, Col)
  {
  Contexto.beginPath();
  Contexto.arc (OrigenX+TamanoCelda*(Col+0.5), OrigenY+TamanoCelda*(Fil+0.5),
                6, 0, 2 * Math.PI, false);
  Contexto.fill();
  Contexto.stroke();
  }

//--------------------------------------------------------------
// Devuelve un array con la fila y la columna que corresponden
// a una celda
function Posicion (Celda)
  {
  var Respuesta = [];
  Fil = Math.floor (Celda/MaxCol);
  Col = Celda % MaxCol;
  Respuesta[0] = Fil;
  Respuesta[1] = Col;
  return (Respuesta);
  }

//--------------------------------------------------------------
// Ejecuta una demostración continua
function Demo()
  {
  // Cambiamos los botones
  BotonDemo.style.display = "none";
  BotonParar.style.display = "inline";
  BotonReiniciar.disabled = true;
  BotonCompleta.disabled = true;
  BotonRestaurar.disabled = true;

  // Un ciclo completo
  Reiniciar();
  Generar();
  Resolver();
  var Pasos = Mostrar();

  // Repetimos el proceso tras tres segundos mostrando el resultado
  TemporizadorDemo = setTimeout (Demo, Pasos*TiempoEspera + 3000);
  }

//--------------------------------------------------------------
// Para la demostración
function Parar()
  {
  BotonDemo.style.display = "inline";
  BotonParar.style.display = "none";
  BotonReiniciar.disabled = false;
  BotonCompleta.disabled = false;
  BotonRestaurar.disabled = false;
  Reiniciar();
  }

//--------------------------------------------------------------
// Devuelve un número entero aleatorio entre
// 0 (incluido) y el dado (excluido)
function Aleatorio (Max)
  { return Math.floor(Math.random()*Max); }

//--------------------------------------------------------------
// Revuelve los elementos de un array
// http://bost.ocks.org/mike/shuffle/
function Revuelve (array)
  {
  var m = array.length, t, i;

  // Mientras queden elementos que revolver…
  while (m)
    {
    // Elegimos un elemento de los que quedan…
    i = Math.floor(Math.random() * m--);

    // Y lo intercambiamos con el elemento actual
    t = array[m];
    array[m] = array[i];
    array[i] = t;
    }

  return array;
  }

//--------------------------------------------------------------
// Si nos piden pasar a pantalla completa
function PantallaCompleta()
  {
  // Guardamos las dimensiones de la zona de dibujo
  AntiguaAnchura = Contexto.canvas.clientWidth;
  AntiguaAltura = Contexto.canvas.clientHeight;

  // Llevamos a pantalla completa el div con los controles y el dibujo
  ElementoPantallaCompleta (DivPantallaCompleta);

  // Cambiamos el estado de los botones
  BotonCompleta.style.display = "none";
  BotonRestaurar.style.display = "inline";

  // Cambiamos el tamaño del canvas al máximo posible
  CanvasDibujo.width = AjustaTamano (window.screen.availWidth - 32);
  CanvasDibujo.height = AjustaTamano (window.screen.availHeight - 240);

  // Volvemos a dibujar
  Reiniciar();
  }

//--------------------------------------------------------------
// Pasar a pantalla completa un elemento del DOM
function ElementoPantallaCompleta (Elemento)
  {
  // Método genérico
  if (Elemento.requestFullscreen)
    { Elemento.requestFullscreen(); }

  // Mozilla
  else if (Elemento.mozRequestFullScreen)
    { Elemento.mozRequestFullScreen(); }

  // Webkit
  else if (Elemento.webkitRequestFullscreen)
    { Elemento.webkitRequestFullscreen(); }

  // Otro navegador
  else if (Elemento.msRequestFullscreen)
    { Elemento.msRequestFullscreen(); }
  }

//--------------------------------------------------------------
// Dice si estamos en modo pantalla completa
function EstamosPantallaCompleta()
  {
  Respuesta = false;

  if ( document.fullscreenElement    || document.webkitFullscreenElement ||
       document.mozFullScreenElement || document.msFullscreenElement )
    { Respuesta = true; }

  return Respuesta;
  }

//--------------------------------------------------------------
// Si nos cambian el modo de pantalla completa
function CambioEnPantallaCompleta()
  {
  if ( ! EstamosPantallaCompleta() )
    {
    // Dejamos todo como estaba
    CanvasDibujo.width = AntiguaAnchura;
    CanvasDibujo.height = AntiguaAltura;
    BotonCompleta.style.display = "inline";
    BotonRestaurar.style.display = "none";

    Reiniciar();
    }
  }

//--------------------------------------------------------------
// Si nos piden restaurar la pantalla normal
function Restaurar()
  {
  // Método general
  if (document.exitFullscreen)
    { document.exitFullscreen(); }

  // Mozilla
  else if (document.mozCancelFullScreen)
    { document.mozCancelFullScreen(); }

  // Webkit
  else if (document.webkitExitFullscreen)
    { document.webkitExitFullscreen(); }

  // Otro navegador
  else if (document.msExitFullscreen)
    { document.msExitFullscreen(); }
  }

//--------------------------------------------------------------
// Si nos piden hacer más ancha la zona de dibujo
function MasAncho()
  {
  // Cambiamos el tamaño
  CanvasDibujo.width = Contexto.canvas.clientWidth + PasoCambioTamano;

  // Volvemos a dibujar
  Reiniciar();
  }

//--------------------------------------------------------------
// Si nos piden hacer más estrecha la zona de dibujo
function MasEstrecho()
  {
  // Vemos cuánto ocupa ahora
  var Anchura = Contexto.canvas.clientWidth;

  // Si aun hay sitio
  if ( Anchura > 10 + 5*TamanoCelda )
    {
    // Cambiamos el tamaño
    CanvasDibujo.width = Contexto.canvas.clientWidth - PasoCambioTamano;

    // Volvemos a dibujar
    Reiniciar();
    }
  }

//--------------------------------------------------------------
// Si nos piden hacer más alta la zona de dibujo
function MasAlto()
  {
  // Cambiamos el tamaño
  CanvasDibujo.height = Contexto.canvas.clientHeight + PasoCambioTamano;

  // Volvemos a dibujar
  Reiniciar();
  }

//--------------------------------------------------------------
// Si nos piden hacer más baja la zona de dibujo
function MasBajo()
  {
  // Vemos cuánto ocupa ahora
  var Altura = Contexto.canvas.clientHeight;

  // Si aun hay sitio
  if ( Altura > 10 + 5*TamanoCelda )
    {
    // Cambiamos el tamaño
    CanvasDibujo.height = Contexto.canvas.clientHeight - PasoCambioTamano;

    // Volvemos a dibujar
    Reiniciar();
    }
  }

//--------------------------------------------------------------
// Activa la visión del DIV de Historia
function Historia()
  {
  Cierra();
  DivHistoria.style.display = "block";
  }

//--------------------------------------------------------------
// Activa la visión del DIV de Créditos
function Creditos()
  {
  Cierra();
  DivCreditos.style.display = "block";
  }

//--------------------------------------------------------------
// Activa la visión del DIV de Licencia
function Licencia()
  {
  Cierra();
  DivLicencia.style.display = "block";
  }

//--------------------------------------------------------------
// Activa la visión del DIV de Descarga
function Descarga()
  {
  Cierra();
  DivDescarga.style.display = "block";
  }

//--------------------------------------------------------------
// Activa la visión del DIV de Técnicas
function Tecnicas()
  {
  Cierra();
  DivTecnicas.style.display = "block";
  }

//--------------------------------------------------------------
// Cierra todos los DIV de explicaciones
function Cierra()
  {
  DivHistoria.style.display = "none";
  DivCreditos.style.display = "none";
  DivLicencia.style.display = "none";
  DivDescarga.style.display = "none";
  DivTecnicas.style.display = "none";
  }

//--------------------------------------------------------------
// Ajusta un número para que venga bien como dimensión para la
// zona de dibujo: 10 píxeles de marco y un número exacto de celdas
function AjustaTamano (Numero)
  {
  var Sigue = true;

  while ( Sigue )
    {
    if ( (Numero-10) % TamanoCelda != 0 )
      { Numero--; }
    else
      { Sigue = false; }
    }

  return (Numero);
  }

//--------------------------------------------------------------
// Función portable que añade un evento
function AgregaEvento (elemento, evType, funcion, useCapture)
  {
  // Manejador de eventos compatible con navegadores IE5+, NS6 y Mozilla
  // Autor: Scott Andrew
  if ( elemento.addEventListener )
    {
    elemento.addEventListener (evType, funcion, useCapture);
    return true;
    }
  else if ( elemento.attachEvent )
    {
    var r = elemento.attachEvent ('on' + evType, funcion);
    return r;
    }
  else
    { elemento ['on' + evType] = funcion; }
  }

//--------------------------------------------------------------
// La función que inicia todo el sistema
function IniciaTodo()
  {
  // Averiguamos los ID de los elementos
  BotonReiniciar = document.getElementById ('reiniciar');
  BotonGenerar = document.getElementById ('generar');
  BotonResolver = document.getElementById ('resolver');
  BotonMostrar = document.getElementById ('mostrar');
  BotonCompleta = document.getElementById ('completa');
  BotonRestaurar = document.getElementById ('restaurar');
  BotonDemo = document.getElementById ('demo');
  BotonParar = document.getElementById ('parar');
  BotonAncho = document.getElementById ('ancho');
  BotonEstrecho = document.getElementById ('estrecho');
  BotonAlto = document.getElementById ('alto');
  BotonBajo = document.getElementById ('bajo');
  BotonHistoria = document.getElementById ('historia');
  BotonCreditos = document.getElementById ('creditos');
  BotonLicencia = document.getElementById ('licencia');
  BotonDescarga = document.getElementById ('descarga');
  BotonTecnicas = document.getElementById ('tecnicas');
  BotonCerrar1 = document.getElementById ('botoncerrar1');
  BotonCerrar2 = document.getElementById ('botoncerrar2');
  BotonCerrar3 = document.getElementById ('botoncerrar3');
  BotonCerrar4 = document.getElementById ('botoncerrar4');
  BotonCerrar5 = document.getElementById ('botoncerrar5');
  CanvasDibujo = document.getElementById ('dibujo');
  SelectTamano = document.getElementById ('tamano');
  DivPantallaCompleta = document.getElementById ('divpantallacompleta');
  DivHistoria = document.getElementById ('divhistoria');
  DivCreditos = document.getElementById ('divcreditos');
  DivLicencia = document.getElementById ('divlicencia');
  DivDescarga = document.getElementById ('divdescarga');
  DivTecnicas = document.getElementById ('divtecnicas');

  // Valores iniciales
  CanvasDibujo.width = AjustaTamano (window.innerWidth - 50);
  ImagenMuro = new Image();
  ImagenMuro.src = 'imagen/muro.png';
  ImagenInfo = new Image();
  ImagenInfo.src = 'imagen/info.png';
  ImagenSalida = new Image();
  ImagenSalida.src = 'imagen/salida.png';
  ImagenMeta = new Image();
  ImagenMeta.src = 'imagen/meta.png';
  ImagenPaso = new Image();
  ImagenPaso.src = 'imagen/paso.png';
  ImagenPuntoMuerto = new Image();
  ImagenPuntoMuerto.src = 'imagen/puntomuerto.png';

  // Añadimos todos los "listeners" necesarios
  AgregaEvento (BotonReiniciar, 'click', Reiniciar, false);
  AgregaEvento (BotonGenerar, 'click', Generar, false);
  AgregaEvento (BotonResolver, 'click', Resolver, false);
  AgregaEvento (BotonMostrar, 'click', Mostrar, false);
  AgregaEvento (BotonDemo, 'click', Demo, false);
  AgregaEvento (BotonParar, 'click', Parar, false);
  AgregaEvento (BotonCompleta, 'click', PantallaCompleta, false);
  AgregaEvento (BotonRestaurar, 'click', Restaurar, false);
  AgregaEvento (BotonAncho, 'click', MasAncho, false);
  AgregaEvento (BotonEstrecho, 'click', MasEstrecho, false);
  AgregaEvento (BotonAlto, 'click', MasAlto, false);
  AgregaEvento (BotonBajo, 'click', MasBajo, false);
  AgregaEvento (BotonHistoria, 'click', Historia, false);
  AgregaEvento (BotonCreditos, 'click', Creditos, false);
  AgregaEvento (BotonLicencia, 'click', Licencia, false);
  AgregaEvento (BotonDescarga, 'click', Descarga, false);
  AgregaEvento (BotonTecnicas, 'click', Tecnicas, false);
  AgregaEvento (BotonCerrar1, 'click', Cierra, false);
  AgregaEvento (BotonCerrar2, 'click', Cierra, false);
  AgregaEvento (BotonCerrar3, 'click', Cierra, false);
  AgregaEvento (BotonCerrar4, 'click', Cierra, false);
  AgregaEvento (BotonCerrar5, 'click', Cierra, false);

  // El manejador de cambio de pantalla completa
  document.addEventListener ("fullscreenchange", CambioEnPantallaCompleta);
  document.addEventListener ("webkitfullscreenchange", CambioEnPantallaCompleta);
  document.addEventListener ("mozfullscreenchange", CambioEnPantallaCompleta);
  document.addEventListener ("MSFullscreenChange", CambioEnPantallaCompleta);

  // Arrancamos dentro de dos segundos
  window.setTimeout (Reiniciar, 2000);
  }

//--------------------------------------------------------------
// La función que inicia el sistema cuando se carga la página
AgregaEvento (window, 'load', IniciaTodo, false);
