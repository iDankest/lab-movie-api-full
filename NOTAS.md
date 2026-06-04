# NOTAS — Reflexión Semana 7

## 1. ¿Qué parte del proyecto te resultó más difícil y por qué?

La parte más desafiante fue diseñar correctamente el sistema de autenticación JWT junto con el middleware de roles. Coordinar la verificación del token, extraer el usuario, y proteger rutas según el rol (user vs admin) requirió pensar en el flujo completo de cada petición protegida. También la integración de Prisma con transacciones para crear directores sobre la marcha fue tricky al principio.

## 2. ¿Qué cambiarías si tuvieras que hacer este proyecto de nuevo desde cero?

Usaría TypeScript desde el inicio para tener tipado fuerte en los controladores y evitar errores de runtime. También dividiría la lógica de los controladores en servicios separados para mantenerlos más delgados y testearlos unitariamente sin necesidad de supertest.

## 3. ¿Cómo escalarías esta API si necesitase soportar 10.000 usuarios concurrentes?

- **Caché**: Implementaría Redis para cachear respuestas de endpoints populares (`GET /api/peliculas`, estadísticas) y reducir la carga en PostgreSQL.
- **Índices**: Añadiría índices compuestos en Prisma para las consultas más frecuentes (búsqueda por género + nota, favoritos por usuario).
- **Horizontal scaling**: Pondría la API detrás de un balanceador de carga (NGINX/HAProxy) con múltiples instancias del servidor. Usaría PM2 en modo cluster para aprovechar todos los cores.
- **Base de datos**: Usaría read replicas de PostgreSQL para las consultas de lectura y mantendría un solo master para escrituras.
- **Rate limiting**: El rate limiting ya incluido (express-rate-limit) ayuda a prevenir abusos.

## 4. ¿Qué ventaja real te ha dado TDD en este proyecto? ¿Hubo algún caso donde el test te hizo detectar un bug antes de probarlo manualmente?

TDD me obligó a pensar en los contratos de la API antes de escribir la implementación. En particular, el test de favoritos duplicados (status 409) me hizo darme cuenta de que necesitaba el `@@unique` compuesto en el schema de Prisma, y el test de exclusión de IDs en el endpoint de IA reveló que necesitaba convertir los IDs a Number antes de pasarlos a Prisma. Sin los tests, estos bugs habrían aparecido en producción.
