# FrontendWebEmotions

El repositorio contiene el frontend de la aplicación WebEmotions, que se encarga de la explotación gráfica 
de unos datos representativos de la población trabajadora española que consume mediante endpoints que lo conectan
a dos servidores Flask.

La interfaz permite explorar, comparar y representar gráficamente la evolución de emociones y 
dimensiones afectivas simuladas a lo largo del tiempo.

## Estructura del proyecto
FRONTENDWEBEMOTIONS/
├── .angular/                   # Configuración interna de Angular
├── .vscode/                    # Configuraciones del editor (VS Code)
├── dist/                       # Archivos generados tras build
├── documentation/              # Documentación del proyecto
├── node_modules/               # Dependencias del proyecto
├── public/                     # Archivos públicos
├── src/
├── app/                                # Carpeta raíz del núcleo de la app
│   ├── @core/
    └── common/
        ├── api/               # Servicios para comunicación con el backend o lectura de datos
        ├── layout-header/     # Componentes relacionados con la cabecera del layout (navbar, título, etc.)
        ├── layout-main/       # Componentes del layout principal (contenedor de vistas)
        └── utils/             # Funciones utilitarias reutilizables en toda la app
│   ├── analysis/                       # Módulo de análisis de datos emocionales
│   ├── audio/                          # Módulo de gestión y representación de audios
│   ├── authentication/                # Módulo de login, tokens y seguridad
│   ├── charts/                         # Componentes para representaciones gráficas
│   ├── config/                         # Configuración y constantes generales
│   ├── individual/                    # Formulario para obtener datos para un trabajador
│   ├── principal/                     # Vista principal o dashboard principal
│   ├── shared/                         # Componentes y módulos reutilizables
│   ├── shift-representation/          # Representación visual de turnos/laborales
│   └── workers/                        # Módulo de gestión de usuarios o trabajadores simulados
│
├── app-routing.module.ts              # Rutas de navegación de la app
├── app.component.html                 # HTML del componente raíz
├── app.component.scss                 # Estilos del componente raíz
├── app.component.spec.ts             # Test del componente raíz
├── app.component.ts                  # Lógica del componente raíz
├── app.module.server.ts              # Configuración para Angular Universal (SSR)
├── app.module.ts                     # Módulo principal de Angular
│
├── assets/                            # Recursos estáticos (imágenes, JSONs, etc.)
├── index.html                         # Entrada HTML principal de Angular
├── main.server.ts                     # Entrada del servidor para SSR
├── main.ts                            # Bootstrap de la app Angular
├── styles.scss                        # Estilos globales de la aplicación
├── .editorconfig               # Configuración de estilos del código
├── .gitignore                  # Archivos y carpetas ignorados por Git
├── angular.json                # Configuración de Angular CLI
├── package.json                # Dependencias y scripts de NPM
├── package-lock.json           # Versión exacta de dependencias instaladas
├── README.md                   # Documentación general del proyecto
├── server.ts                   # Lógica del servidor para SSR (Angular Universal)
├── test_carga.ts               # Script de test/carga (custom)
├── tsconfig.app.json           # Configuración TypeScript para app
├── tsconfig.json               # Configuración global de TypeScript
├── tsconfig.spec.json          # Configuración para tests unitarios

## Módulos más relevantes

### app/analysis
app/
└── analysis/                        # Módulo encargado del análisis de datos emocionales
    ├── model/
    │   └── classification.ts       # Modelo de clasificación emocional de trabajadores por tendencia
    ├── analysis.component.html     # Vista HTML principal del análisis
    ├── analysis.component.scss     # Estilos asociados al componente
    ├── analysis.component.spec.ts  # Test del componente
    ├── analysis.component.ts       # Lógica del componente de análisis
    ├── analysis.service.spec.ts    # Test del servicio de análisis
    └── analysis.service.ts         # Servicio que gestiona la lógica de análisis de datos

En el módulo de análisis, se reciben los datos de los trabajadores ya agrupados por tendencia psicológica
y se representan de manera que el usuario tenga una idea global de la plantilla.

### app/audio
app/
└── audio/                             # Módulo para la gestión de audio y emociones derivadas
    ├── audio-vad-live/                # Procesamiento en vivo con Voice Activity Detection (VAD)
    │   ├── audio-emotions/            # Componente para emociones detectadas en tiempo real
    │   │   ├── audio-emotions.component.html
    │   │   ├── audio-emotions.component.scss
    │   │   ├── audio-emotions.component.spec.ts
    │   │   └── audio-emotions.component.ts
    │   ├── audio-vad-live.component.html
    │   ├── audio-vad-live.component.scss
    │   ├── audio-vad-live.component.spec.ts
    │   └── audio-vad-live.component.ts
    │
    ├── model/                         # Modelos de datos para gestionar forced_Alignment
    │   ├── alignment.ts
    │   └── recording-emotions.ts      # Modelo de datos para gestionar análisis emocional
    │
    ├── csv-audios/                    # (Presuntamente) gestión de archivos de audio como CSV
    │
    ├── deferred-inference/           # Inferencias en diferido sobre datos de audio
    │   ├── deferred-inference.component.html
    │   ├── deferred-inference.component.scss
    │   ├── deferred-inference.component.spec.ts
    │   └── deferred-inference.component.ts
    │
    ├── force-alignment/              # Servicio para realizar peticiones y obtener alineación forzada para grabaciones
    │   └── force-alignment.service.ts
    │
    ├── audio.component.html
    ├── audio.component.scss
    ├── audio.component.spec.ts
    ├── audio.component.ts            # Componente general del módulo de audio
    ├── audio.service.spec.ts
    └── audio.service.ts              # Servicio general del módulo de audio

El módulo de audio es de los más extensos, ya que engloba: 
- Audio-Vad-Live
La interacción por voz en tiempo real, detecta voz y silencio 
según un tiempo establecido como intervalo de silencio. Este se comunica a través del audio.service.ts 
con el backend y tras procesar el audio, se obtiene el análisis emocional y su forced alignment. Para representar cada grabación obtenida
junto con su análisis se crean:
	- Audio-Emotions
	Se gestiona visualmente la representación de lo obtenido anteriormente.
- Deferred-Inference
Permite subir archivos .wav y se procesas de la misma manera que un audio en tiempo real.
En ambos se pueden descargar los audios y los datos analíticos asociados generados.

## app/charts
charts/                            # Módulo encargado de la visualización de datos emocionales
    ├── categoric/                 # Gráficos basados en emociones categóricas (ej: tristeza, alegría)
    ├── dimensional/  			  # Gráficos basados en emociones dimensionales (ej: valence, arousal)
    ├── individual/ 				# Contiene el formulario del que se obtienen los datos de un trabajador.
	├── shift-representation/ 		# Contiene el formulario del que se obtienen los datos de un turno.
	
## Instalación

Para acceder al código como tal puede descargarse desde:
https://unioviedo-my.sharepoint.com/:f:/g/personal/uo277578_uniovi_es/EpwMs06KVRlPuqvWLdXoaQ4B8kOrUOc2Hm1l6yfcLQkVpw?e=V3T0Qm
es la carpeta comprimida que se llama frontendWebEmotions.zip .

O si no, está disponible en el repositorio de github desde el cual se puede hacer 'git clone https://github.com/celiabarral1/tfg_front'

Con el comando 'npm install' se lee el packaje.json y se preparara el entorno.

## Servidor de desarrollo

Ejecuta ng serve para iniciar el servidor de desarrollo. Navega a http://localhost:4200/ .


## Build

Ejecuta 'ng build' para compilar el proyecto. Los artefactos resultantes de la build se almacenarán en el directorio dist/

## Test unitarios

Ejecuta 'ng test'

## Más información

Más información en [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) .

## Tecnology
- Framework: Angular 
- Representación gráfica: Chart.js , Wavesurfer.js
- Inferencia de audio en tiempo real: VAD.ts
- Patrón: MVVC

