from random import choice
from experta import *


class Cajero(Fact):
    """Info about the traffic light."""
    pass

class Verificacion(KnowledgeEngine):
    @Rule(verificacion.cajero << ver(opcion=C('Si') | C('No')))
    def verificar(self, cajero):
        print("Tipo de transaccion:")

    class Trans_No_Valida(KnowledgeEngine):
    @Rule(No_Autorizado(opcion='Negada'))
    def Eror(self):
        print("Existe un error para procesar su petición!!!")

class Trans_Valida(KnowledgeEngine):
    @Rule(Extraccion(opcion='Pedir'))
    def PedirMonto(self):
        print("Cuanto Monto Desea Retirar?")

    @Rule(Extraccion(opcion='Descontar'))
    def Descontar(self):
        print("Se ha Descontado la cantidad Extraida de su Cuenta")

    @Rule(Extraccion(opcion='Generar'))
    def Generar(self):
        print("Se imprimirá un Comprobante de su Monto")

    @Rule(Depositar(opcion='Pedir'))
    def PedirMonto(self):
        print("Cuanto Monto Desea Depositar?")

    @Rule(Depositar(opcion='Sumar'))
    def SumarMonto(self):
        print("Se ha Agregara la cantidad Ingresada a su Cuenta")

    @Rule(Depositar(opcion='Generar'))
    def Generar(self):
        print("Se imprimirá un Comprobante de su Monto")

    @Rule(Saldo(opcion='Obtener'))
    def Obtener(self):
        print("Se Mostrará su Monto total:")

    @Rule(Saldo(opcion='Generar'))
    def Generar(self):
        print("Se Generará un Informe de su Monto")