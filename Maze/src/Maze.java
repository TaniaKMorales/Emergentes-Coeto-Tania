import java.awt.*;

public class Maze extends java.applet.Applet implements Runnable {
	public Maze() {
	}

    int[][] maze;  // Descripcion del estado del laberinto.  El valor de maze[i][j]
                   // es una de las constantes wallCode, pathcode, emptyCode,
                   // o visitedCode.  (Tambien puede ser negativo, temporalmente,
                   // durante createMaze().)
                   //    El laberinto esta hecho de muros y pasillos.  maze[i][j]
                   // es una parte de la pared o una parte del pasillo.  La celda
                   // que es parte del passillo se representa por pathCode
                   // si pertenece al pasillo valido para resolver el laberinto,por
                   // visitedCode si ha sido explorado sin encontrar solucion
                   // , y por emptyCode si no ha sido explorado.

    final static int backgroundCode = 0;
    final static int wallCode = 1;
    final static int pathCode = 2;
    final static int emptyCode = 3;
    final static int visitedCode = 4;
    
       // los siguientes 6 elementos se establecen en init(), y pueden 
       // especificarse utilizando los parametros del applet

    Color[] color = new Color[5];  // colores asociados a las cinco constantes anteriores;
    int rows = 21;          // numero de filas de celdas en el laberinto, incluyendo la pared del borde
    int columns = 21;       // numero de columnas en el laberinto, incluyendo la pared del borde
    int border = 0;         // numero minimo de pixels entre el laberinto y el borde del applet
    int sleepTime = 5000;   // tiempo de espera despues de resolver uno y antes de hacer otro
    int speedSleep = 50;    // espera entre pasos mientras se esta resolviendo el laberinto
    
    Thread mazeThread;   // hebra para crear y resolver el laberinto
    Graphics me = null;  // contexto grafico para el applet; creado en checkSize()
    
    int width = -1;   // ancho del applet, se establecera en checkSize()
    int height = -1;  // alto del applet se establecera en checkSize()

    int totalWidth;   // ancho del applet, menos el area del borde (se define en checkSize())
    int totalHeight;  // alto del applet, menos el area del borde (se define en checkSize())
    int left;         // borde izquierdo del laberintp, autorizado por el borde (se define en checkSize())
    int top;          // borde superior del laberinto,  autorizado por el borde (se define en checkSize())
    
    boolean mazeExists = false;  // se pone a true cuando maze[][] es correcto; usasdo en 
                                 // redrawMaze();se pone a true en createMaze(), y
                                 // puesto a falso en run()



    Integer getIntParam(String paramName) {
          // Rutina de utilidad para leer un parametro de applet que sea numero.
          // devuelve null si no existe el parametro, o si el valor no es
          // un numero entero valido.
       String param = getParameter(paramName);
       if (param == null)
          return null;
       int i;
       try {
          i = Integer.parseInt(param);
       }
       catch (NumberFormatException e) {
          return null;
       }
       return new Integer(i);
    }
    
    Color getColorParam(String paramName) {
          // Rutina de utilidad para leer un parametro de applet que sea color
          // devuelve null si no existe el parametro, o si el valor no es
          // un color valido.
          // Los colores se pueden especificar como tres enteros separados por espacio
          // definiendo componentes RGB del rando de 0 a 255;
          // Tambien se aceptan los nombres de colores estandares de Java
       String param = getParameter(paramName);
       if (param == null || param.length() == 0)
          return null;
       if (Character.isDigit(param.charAt(0))) {  // prueba analizar color RGB 
          int r=0,g=0,b=0;
          int pos=0;
          int d=0;
          int len=param.length();
          while (pos < len && Character.isDigit(param.charAt(pos)) && r < 255) {
              d = Character.digit(param.charAt(pos),10);
              r = 10*r + d;
              pos++;
          }
          if (r > 255)
             return null;
          while (pos < len && !Character.isDigit(param.charAt(pos)))
             pos++;
          if (pos >= len)
             return null;
          while (pos < len && Character.isDigit(param.charAt(pos)) && g < 255) {
              d = Character.digit(param.charAt(pos),10);
              g = 10*g + d;
              pos++;
          }
          if (g > 255)
             return null;
          while (pos < len && !Character.isDigit(param.charAt(pos)))
             pos++;
          if (pos >= len)
             return null;
          while (pos < len && Character.isDigit(param.charAt(pos)) && b < 255) {
              d = Character.digit(param.charAt(pos),10);
              b = 10*b + d;
              pos++;
          }
          if (b > 255)
             return null;
          return new Color(r,g,b);          
       }
       if (param.equalsIgnoreCase("black"))
          return Color.black;
       if (param.equalsIgnoreCase("white"))
          return Color.white;
       if (param.equalsIgnoreCase("red"))
          return Color.red;
       if (param.equalsIgnoreCase("green"))
          return Color.green;
       if (param.equalsIgnoreCase("blue"))
          return Color.blue;
       if (param.equalsIgnoreCase("yellow"))
          return Color.yellow;
       if (param.equalsIgnoreCase("cyan"))
          return Color.cyan;
       if (param.equalsIgnoreCase("magenta"))
          return Color.magenta;
       if (param.equalsIgnoreCase("pink"))
          return Color.pink;
       if (param.equalsIgnoreCase("orange"))
          return Color.orange;
       if (param.equalsIgnoreCase("gray"))
          return Color.gray;
       if (param.equalsIgnoreCase("darkgray"))
          return Color.darkGray;
       if (param.equalsIgnoreCase("lightgray"))
          return Color.lightGray;
       return null;  // el parametro no es un color valido
    }

    public void init() {
         Integer parm;
         parm = getIntParam("rows");
         if (parm != null && parm.intValue() > 4 && parm.intValue() <= 500) {
            rows = parm.intValue();
            if (rows % 2 == 0)
               rows++;
         }
         parm = getIntParam("columns");
         if (parm != null && parm.intValue() > 4 && parm.intValue() <= 500) {
            columns = parm.intValue();
            if (columns % 2 == 0)
               columns++;
         }
         parm = getIntParam("border");
         if (parm != null && parm.intValue() > 0 && parm.intValue() <= 100)
            border = parm.intValue();
         parm = getIntParam("sleepTime");
         if (parm != null && parm.intValue() > 0)
            sleepTime = parm.intValue();
         parm = getIntParam("speed");
         if (parm != null && parm.intValue() > 0 && parm.intValue() < 6)
            switch (parm.intValue()) {
               case 1: speedSleep = 1; break;
               case 2: speedSleep = 25; break;
               case 3: speedSleep = 50; break;
               case 4: speedSleep = 100; break;
               case 5: speedSleep = 200; break;
            }
         color[wallCode] = getColorParam("wallColor");
         if (color[wallCode] == null) 
            color[wallCode] = Color.black;
         color[pathCode] = getColorParam("pathColor");
         if (color[pathCode] == null)
            color[pathCode] = new Color(200,0,0);
         color[emptyCode] = getColorParam("emptyColor");
         if (color[emptyCode] == null)
            color[emptyCode] = new Color(128,128,255);
         color[backgroundCode] = getColorParam("borderColor");
         if (color[backgroundCode] == null)
            color[backgroundCode] = Color.white;
         color[visitedCode] = getColorParam("visitedColor");
         if (color[visitedCode] == null)
            color[visitedCode] = color[emptyCode];
         setBackground(color[backgroundCode]);
    }
    
    void checkSize() {
          // Se llama cada vez que tiene que dibujarse algo, para comprobar
          // el tamaño del applet, y comprobar las constantes que dependen
          // del tamaño, eso incluye el contexto grafico del
          // applet.
       if (size().width != width || size().height != height) {
          width  = size().width;
          height = size().height;
          int w = (width - 2*border) / columns;
          int h = (height - 2*border) / rows;
          left = (width - w*columns) / 2;
          top = (height - h*rows) / 2;
          totalWidth = w*columns;
          totalHeight = h*rows; 
          if (me != null)
             me.dispose();  // se deshace del antiguo contexto
          me = getGraphics();
       }
    }

    public void start() {
        if (mazeThread == null) {
          mazeThread = new Thread(this);
          mazeThread.start();
        }
        else
           mazeThread.resume();
    }

    public void stop() {
        if (mazeThread != null)
            mazeThread.suspend();
    }
    
    public void destroy() {
       if (mazeThread != null)
          mazeThread.stop();
    }

    public void paint(Graphics g) {
        checkSize();
        redrawMaze(g);
    }
    
    public void update(Graphics g) {  //no es necesario rellenarlo del color de fondo
        paint(g);                     //  porque redrawMaze() ya lo hace
    }
    
    synchronized void redrawMaze(Graphics g) {
          // Dibuja el laberinto entero
        g.setColor(color[backgroundCode]);
        g.fillRect(0,0,width,height);
        if (mazeExists) {
           int w = totalWidth / columns;  // ancho de cada celda
           int h = totalHeight / rows;    // alto de cada celda
           for (int j=0; j<columns; j++)
               for (int i=0; i<rows; i++) {
                   if (maze[i][j] < 0)
                      g.setColor(color[emptyCode]);
                   else
                      g.setColor(color[maze[i][j]]);
                   g.fillRect( (j * w) + left, (i * h) + top, w, h );
               }
         }
    }

    synchronized void putSquare(int row, int col, int colorNum) {
           // dibuja una celda del laberinto en el contexto grafico "me"
        checkSize();
        int w = totalWidth / columns;  // ancho de cada celda
        int h = totalHeight / rows;    // alto de cada celda
        me.setColor(color[colorNum]);
        me.fillRect( (col * w) + left, (row * h) + top, w, h );
    }

    public void run() {
           // metodo run para la hebra que crea y resuelve el laberinto
       try { Thread.sleep(2000); } // pequeña espera antes de empezar
       catch (InterruptedException e) { }
       while (true) {
          makeMaze();
          solveMaze(1,1);
          try { Thread.sleep(sleepTime); }
          catch (InterruptedException e) { }
          mazeExists = false;
          checkSize();
          redrawMaze(me);   // borrar el laberinto antiguo
       }
    }

    void makeMaze() {
            // Crea un laberinto aleatorio.  la estrategia es empezar con una reja
            // de habitaciones sueltas, separadas por muros, luego cada uno de los 
            // muros de separacion, en orden aleatorio. Si el tirar el muro no provoca
            // un bucle en el laberinto, se tira, si no, se deja en su sitio
           
        if (maze == null)
           maze = new int[rows][columns];
        int i,j;
        int emptyCt = 0; // numero de habitaciones
        int wallCt = 0;  // numero de muros
        int[] wallrow = new int[(rows*columns)/2];  // posicion de los muros entre las habitaciones
        int[] wallcol = new int[(rows*columns)/2];
        for (i = 0; i<rows; i++)  // empieza cargando todo con muros
            for (j = 0; j < columns; j++)
                maze[i][j] = wallCode;
        for (i = 1; i<rows-1; i += 2)  // crea una rejilla de habitaciones
            for (j = 1; j<columns-1; j += 2) {
                emptyCt++;
                maze[i][j] = -emptyCt;  // cada habitacion se representa por un numero negativo distinto
                if (i < rows-2) {  // Guarda informacion sobre los muros que rodean esta habitacion
                    wallrow[wallCt] = i+1;
                    wallcol[wallCt] = j;
                    wallCt++;
                }
                if (j < columns-2) {  // guarda informacion del muro de la derecha
                    wallrow[wallCt] = i;
                    wallcol[wallCt] = j+1;
                    wallCt++;
                }
             }
        mazeExists = true;
        checkSize();
        redrawMaze(me);  // muestra el laberinto
        int r;
        for (i=wallCt-1; i>0; i--) {
            r = (int)(Math.random() * i);  // Escoge un muro para tirar de forma aleatoria
            tearDown(wallrow[r],wallcol[r]);
            wallrow[r] = wallrow[i];
            wallcol[r] = wallcol[i];
        }
        for (i=1; i<rows-1; i++)  // reemplaza los valores negativos de maze[][] por emptyCode
           for (j=1; j<columns-1; j++)
              if (maze[i][j] < 0)
                  maze[i][j] = emptyCode;
    }

    void tearDown(int row, int col) {
       // derriba un muro, a menos que eso provoque un bucle.  derribar un muro 
       // une dos  "habitaciones" en una.  (Las habitaciones son el inicio de los corredores
       // cuando crezcan.)  Cuando se quita un muro, las habitaciones se convierten en
       // un area por la que se puede pasar, por lo que todas las celdas de la habitacion
       // tienen el mismo codigo. Observe que si el codigo de la habitacion en los dos lados
       // del muro tienen el mismo codigo, significa que el muro no se puede quitar porque 
       // crearia un bucle, entonces, se deja en su lugar.
            if (row % 2 == 1 && maze[row][col-1] != maze[row][col+1]) {
                       // fila impar; los muros separan habitaciones horizontalmente
                fill(row, col-1, maze[row][col-1], maze[row][col+1]);
                maze[row][col] = maze[row][col+1];
                putSquare(row,col,emptyCode);
                try { Thread.sleep(speedSleep); }
                catch (InterruptedException e) { }
             }
            else if (row % 2 == 0 && maze[row-1][col] != maze[row+1][col]) {
                      // fila par; el muro separa habitaciones en vertical
                fill(row-1, col, maze[row-1][col], maze[row+1][col]);
                maze[row][col] = maze[row+1][col];
                putSquare(row,col,emptyCode);
                try { Thread.sleep(speedSleep); }
                catch (InterruptedException e) { }
             }
    }

    void fill(int row, int col, int replace, int replaceWith) {
           // llamada porr tearDown() para cambiar "codigos de habitacion".
        if (maze[row][col] == replace) {
            maze[row][col] = replaceWith;
            fill(row+1,col,replace,replaceWith);
            fill(row-1,col,replace,replaceWith);
            fill(row,col+1,replace,replaceWith);
            fill(row,col-1,replace,replaceWith);
        }
    }

    boolean solveMaze(int row, int col) {
               // Prueba de resolver el laberinto recorriendo continuamente el camino desde
               // (row,col).  Devuelve cierto si encuentra solucion.  El laberinto se considera
               // valido si el camino empieza en la primera celda.
         if (maze[row][col] == emptyCode) {
             maze[row][col] = pathCode;      // añade esta celda al camino
             putSquare(row,col,pathCode);
             if (row == rows-2 && col == columns-2)
                 return true;  // el camino ha llegado a su fin
             try { Thread.sleep(speedSleep); }
             catch (InterruptedException e) { }
             if ( solveMaze(row-1,col) ||     // prueba de resolver el laberinto extendiendo
                  solveMaze(row,col-1) ||     // el camino en cada una de las direcciones posibles
                  solveMaze(row+1,col) ||
                  solveMaze(row,col+1) )
                return true;
             // el laberinto no se puede resolver desde esta celda,retrocedemos
             maze[row][col] = visitedCode;   //marca la celda como visitada
             putSquare(row,col,visitedCode);
             try { Thread.sleep(speedSleep); }
             catch (InterruptedException e) { }
          }
          return false;
    }

}
