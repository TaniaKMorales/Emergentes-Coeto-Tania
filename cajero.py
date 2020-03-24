from random import choice
from experta import *


class Cajero(Fact):
    """Info about the traffic light."""
    pass


class Pago_Autorizado(KnowledgeEngine):
    @Rule(Cajero(tarjeta='verificada'))
    def tarjeta_cajero(self):
        print("Pago autorizado")

    @Rule(Cajero(Fecha = 'no vencida'))
    def fecha_cajero(self):
        print("Pago  autorizado")

    @Rule(Cajero(nip = 'correcto'))
    def NIP_cajero(self):
        print("Pago  autorizado")
        
    @Rule(Cajero(intentos = 'no excedidos'))
    def intentos_cajero(self):
        print("Pago  autorizado")
      
    @Rule(Cajero(balance = 'suficiente'))
    def balance_cajero(self):
        print("Pago  autorizado")

    @Rule(Cajero(limite ='no excedido'))
    def limite_cajero(self):
        print("Pago  autorizado")

class Pago_No_Autorizado(KnowledgeEngine):
    @Rule(Cajero(tarjeta='no verificada'))
    def tarjeta_cajero(self):
        print("Pago NO autorizado")

    @Rule(Cajero(Fecha = 'vencida'))
    def fecha_cajero(self):
        print("Pago NO autorizado")

    @Rule(Cajero(nip = 'incorrecto'))
    def NIP_cajero(self):
        print("Pago NO autorizado")
        
    @Rule(Cajero(intentos = 'excedidos'))
    def intentos_cajero(self):
        print("Pago NO autorizado")
      
    @Rule(Cajero(balance = 'No suficiente'))
    def balance_cajero(self):
        print("Pago NO autorizado")

    @Rule(Cajero(limite ='excedido'))
    def limite_cajero(self):
        print("Pago NO autorizado")
    
   

>>> engine = Pago_Autorizado()
>>> engine = Pago_No_Autorizado()
>>> engine.reset()
>>> engine.declare(Cajero(tarjeta=choice(['verificada', 'no verificada'])))
>>> engine.declare(Cajero(fecha=choice(['verificada', 'no verificada'])))
>>> engine.declare(Cajero(NIP=choice(['verificado', 'incorrecto'])))
>>> engine.declare(Cajero(intentos=choice(['no excedidos', 'excedidos'])))
>>> engine.declare(Cajero(balance=choice(['suficiente', 'insuficiente'])))
>>> engine.declare(Cajero(limite=choice(['no excedido', 'excedido'])))
>>> engine.run()