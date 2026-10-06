Calixto Diaz 2023214059 - - - - Keyder Granados 2023214035

1. ¿Cuál es la responsabilidad de Service?
    Es el encargado de aplicar las reglas del negocio (la lógica de la aplicación).
    Decide si algo se puede hacer o no, y coordina qué se guarda y qué no.

2. ¿Qué diferencia existe entre Service y Repository?
   El Service piensa y decide (aplica las reglas y la lógica).

   El Repository simplemente obedece y ejecuta .

3. ¿Por qué Service no debería retornar entidades JPA?
   Porque las entidades están amarradas a la base de datos. Si las devolvemos directamente, exponemos 
   detalles internos que el cliente de la API no necesita ver. Por eso usamos DTOs .

4. ¿Qué ventaja tiene record para DTOs?
   Que nos ahorran escribir código. Con una sola línea crean los campos, los constructores y los métodos 
   para leer los datos, y además aseguran que la información no se pueda modificar por accidente.

5. ¿Qué hace MapStruct?
   Es una herramienta que te ahorra trabajo convirtiendo automáticamente los datos de una entidad de 
   la base de datos a un DTO, sin que tengas que escribir código manual de traducción campo por campo.

6. ¿Por qué preferir constructor injection?
   Porque te obliga a que los componentes obligatorios se entreguen desde el inicio y no puedan cambiar después.

7. ¿Qué diferencia existe entre ResourceNotFoundException y BusinessRuleException?
   ResourceNotFoundException: Significa que lo que buscabas no existe en la base de datos (da un error 404).

BusinessRuleException: Significa que el objeto sí existe, pero rompiste una regla del negocio (por ejemplo, intentar comprar un ticket si el evento ya se llenó, da un error 400).

8. ¿Por qué evitar Optional.get()?
   Porque si el valor resulta estar vacío (null), la aplicación se rompe de golpe lanzando un error. 

9. ¿Cuándo utilizar @Transactional(readOnly = true)?
   Cuando vas a hacer solo consultas. Le avisa a la base de datos que no vas a modificar nada, lo que optimiza el rendimiento y hace que la consulta sea más rápida.

10. ¿Cuándo utilizar @Transactional?
    Cuando vas a hacer operaciones de escritura (guardar, actualizar o borrar datos). Asegura que si algo falla a mitad de camino, la base de 
    datos regrese para no dejar datos a medias o dañados.

11. ¿Por qué una compra debe ser atómica?
    Porque o se hace todo completo o no se hace nada. Evita que se cobre o se guarde un ticket a medias si ocurre un error a mitad de la transacción.

12. ¿Por qué la capacidad pertenece a una regla de Service?
    Porque la base de datos por sí sola no sabe de eventos ni de aforos máximos; es el servicio el que debe ir a contar cuántos tickets vendidos hay y compararlos contra la capacidad permitida.

13. ¿Por qué el cálculo de edad pertenece al negocio?
    Porque es una regla estricta de la aplicación (prohibir la entrada a menores de edad). El servicio toma la fecha de nacimiento del usuario, la compara con la fecha actual y decide si puede comprar o no.

14. ¿Por qué utilizar BigDecimal para precios?
    Porque los números decimales normales de programación cometen pequeños errores matemáticos con los centavos. 

15. ¿Qué diferencia existe entre unit test e integration test?
    Unit Test (Prueba unitaria): Prueba una sola pieza de código aislada usando simulaciones (mocks), sin tocar bases de datos y corre en segundos.

    Integration Test (Prueba de integración): Prueba cómo funcionan juntas varias piezas reales, conectándose incluso a una base de datos real (como Docker/Testcontainers).

16. ¿Por qué Mockito permite probar Service sin PostgreSQL?
    Porque Mockito inventa o simula las respuestas del repositorio. Evitando por completo la necesidad de una base de datos real.

17. ¿Qué demuestra verify(repository, never()).save(...)?
    Demuestra que cuando ocurre un error por una regla de negocio (como un usuario menor de edad), el sistema se detiene y nunca intenta guardar basura en la base de datos.

18. ¿Por qué SOLD_OUT debe actualizarse dentro de la misma transacción?
    Para que el cambio de estado del evento ocurra al mismo tiempo exacto en que se guarda el último ticket. Si se separan, podría haber errores donde se llene el evento pero el estado nunca cambie.

19. ¿Por qué Ticket es una entidad y no solo una relación N:M?
    Porque un ticket no es solo un puente invisible entre usuario y evento; tiene sus propios datos importantes que cambian (código único, tipo, precio, estado de pago y fecha de compra).

20. ¿Qué reglas moverías a componentes especializados si PulsePass creciera?
    El envío de correos de confirmación a un servicio de mensajería asíncrono, y las validaciones de seguridad complejas a componentes dedicados de autenticación.