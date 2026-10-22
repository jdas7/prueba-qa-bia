# language: es
@ui @anon
Característica: El acceso rechaza lo que no es una sesión válida
  Como operador quiero que una clave mala, un formulario vacío o una ruta
  protegida sin sesión no me dejen entrar.

  @CN-02
  Escenario: Una clave incorrecta no entra
    Cuando intenta entrar como el operador de demo con la clave "mala"
    Entonces el acceso avisa "Email o contraseña incorrectos. Revisa los datos e inténtalo de nuevo."
    Y sigue en la pantalla de acceso

  @CN-03
  Escenario: No se puede entrar sin escribir el email
    Cuando intenta entrar sin escribir el email
    Entonces el acceso avisa "Escribe tu email y tu contraseña."
    Y sigue en la pantalla de acceso

  @CN-05
  Escenario: El libro de medidores no se abre sin sesión
    Cuando abre "/medidores" sin haber iniciado sesión
    Entonces sigue en la pantalla de acceso
