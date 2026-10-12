Calixto Diaz 2023214059 - - - - Keyder Granados 2023214035

1\. ¿Qué responsabilidad pertenece al Controller y cuál al Service?
R/ el Controller se encarga de lo HTTP (recibir el request, validar su estructura, elegir el código de respuesta). El Service aplica las reglas de negocio y coordina la persistencia. 



2\. ¿Por qué un Controller no debería acceder directamente a Repository?

R/ 	porque se saltaría la capa de servicios y tendría que duplicar reglas de negocio y transacciones. Además, acoplaría la API a la base de datos y haría los controllers difíciles de probar y mantener.



3\. ¿Qué diferencia existe entre una validación estructural y una regla de negocio?

R/ la estructural revisa la forma del dato, sin consultar nada y se hace con Bean Validation. La regla de negocio depende del estado del sistema y vive en el Service.



4\. ¿Cuándo debe utilizarse 400, 404 y 409?

R/ 400: el request está mal formado o inválido.

404: el recurso no existe.

409: el request es válido, pero choca con el estado actual (duplicado o regla de negocio incumplida).



5\. ¿Por qué una creación debería retornar 201 en lugar de 200?

R/ porque 201 indica específicamente que se creó un recurso nuevo, mientras que 200 solo dice que la operación salió bien. Así el cliente puede distinguir una creación de una consulta o actualización.



6\. ¿Por qué los errores deben utilizar una estructura uniforme?

R/ para que el cliente procese todos los errores con el mismo código, sin casos especiales por endpoint. También facilita las pruebas y evita exponer detalles internos.



7\. ¿Qué ventaja aporta @RestControllerAdvice frente a capturar excepciones en cada endpoint?

R/ centraliza el manejo de errores en un solo lugar. Evita repetir código en cada endpoint, mantiene los controllers delgados y garantiza que todos los errores salgan con el mismo formato.



8\. ¿Por qué @WebMvcTest es más apropiado que @SpringBootTest para estas pruebas?

R/ @WebMvcTest carga solo la capa web, sin base de datos ni el contexto completo. Por eso es más rápido, aislado y no depende de infraestructura; los Services se reemplazan por mocks con @MockitoBean.

9\. ¿Cómo verificarías que un request inválido nunca invoca el Service?

R/ se envía el request inválido con MockMvc, se comprueba el 400 y luego se usa verify(service, never()).metodo(any()).



10\. ¿Qué cambios serían necesarios para agregar autenticación JWT en una fase posterior?

R/ agregar Spring Security, un filtro que valide el token en cada request, un endpoint de login que lo emita y reglas de acceso por rol.

