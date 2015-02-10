SCORM-Manager
=============

Manage SCORM_API_Wrapper and allow to control course workflow

O arquivo Manager.min.js é o responsável por gerar a interatividade da interface do curso, e este arquivo se comunica com o SCORM_API para conduzir ao salvamento de dados em tempo real via Ajax. Abaixo deixo listado os parâmetros de configuração que podem ser utilizados antes do comando Manager.Core.begin():

```
Settings = {
	debug: 'error',
	min_time_per_page: 0,
	resume_prompt: true,
	protect_images: true,
	limit_video_access: true,
	pages_dir: 'html/',
	lang: '',
	straight: true,
	score_by_progress: false,
	score_max: 100,
	score_min: 0,
}
```

debug: Configura a exibição de informações de debug no console do navegador. Os valores são none, error, log, all.

min_time_per_page: Permite impedir o avanço antes que o tempo mínimo seja atingido. Caso a página já tenha sido visto antes está configuração não será aplicada.

resume_prompt: Caso configurado como TRUE, permite que o aluno ao acessar a aula escolha se deseja começar onde parou ou ir a primeira tela do curso.

protect_images: Permite bloquear o clique direito e comandos de arrastar.

limit_video_access: Permite impedir a visualização de vídeos após X visualizações (visualizações durante a mesma sessão são ignoradas). A contagem dos vídeos é individual, e a contagem será incrementada após confirmação do aluno.

pages_dir: Pasta contendo arquivos html de cada item no menu.

lang: Permite internacionalizar o curso. Uma pasta dentro da pasta html deverá ser criada com o idioma selecionado nesta configuração (por exemplo html/pt_BR/aula1.html). O arquivo contendo o menu do curso deverá ser nomeado conforme a convenção menu_pt_BR.xml.

straight: Caso configurado como TRUE, impede o aluno de pular páginas do curso.

score_by_progress: Permite pontuar o aluno com base na porcentagem de progresso do mesmo pelo curso. Caso sejam utilizadas outras métricas de pontuação, esta opção pode permanecer como FALSE. O valor da pontuação do aluno estará dentro dos limites score_min e score_max.

score_max: Pontuação máxima possível para este curso.

score_min: Pontuação mínima possível para este curso.

Ganchos
=============

A priori não é necessário editar o arquivo Manager.min.js, bastando utilizar ganchos existentes no código conforme tabela abaixo:


start_manager: Executa logo após a chamada Manager.Core.begin();

load_scorm: Executa quando acontece a conectividade com o SCORM API ou quando o modo teste está ativo;

before_generate_menu: Executa antes do download do menu.xml;

menu_generated_ok: Executa após o HTML do menu ser gerado e inserido; 

menu_generated_error: Executa após falha no processamento do menu;

on_ready: Executa após interface estar preparada para uso;

on_tick: Executa a cada segundo;

choose_page: Executa logo após a escolha de uma página do curso, e antes da validação (dependências, tempo mínimo, etc);
page_not_allowed: Executa após uma dependência ter sido encontrada. A dependência evita que uma página seja vista antes da matéria anterior;

before_page_load: Executa logo após a validação e antes do download do nova página;

after_page_load: Executa após nova página ter sido exibida e catálogo de páginas visitadas ter sido atualizado;

page_loaded_error: Executa após erro de carregamento da nova página;

page_loaded_ok: Executa após nova página ter sido exibida;

before_close_scorm: Executa antes dos comandos de salvamento finais, ao fechar o página do curso;

end_manager: Executa após todas as tarefas serem finalizadas. Não há mais comunicação com backend neste momento, pois o SCORM API já recebeu o comando de encerramento;

course_complete: Executa quando o curso alcança 100%. Só executa uma única vez;

first_page: Executa quando a pessoa está na primeira página e usa o botão Voltar;

last_page: Executa quando a pessoa está na última página e usa o botão Avançar;

before_pack_data: Executa antes da serialização dos dados;

sd_high_volume_data: O limite do campo TEXT (no DB do Moodle) é ~64 mil caracteres. Este gancho executa quando mais de 90% do limite foi alcançado;

after_pack_data: Executa após serialização dos dados e da checagem sd_high_volume_data;

after_console_message: Executa após uma mensagem ser emitida ao console do navegador;

before_protect: Executa antes dos comandos de proteção de conteúdo;

before_protect_video: Executa antes do vídeo ser protegido;

after_protect_video: Executa após vídeo ser protegido;

on_play_video: Executa ao clicar no comando watch_video;

**English traslation coming soon.**

The Manager.min.js file is responsible for generating the interactivity of the course interface, and this file communicates with the SCORM_API to drive the transmission of real-time data via Ajax. Below you will find the configuration parameters that can be used before the Manager.Core.begin () command:

```
Settings = {
	debug: 'error',
	min_time_per_page: 0,
	resume_prompt: true,
	protect_images: true,
	limit_video_access: true,
	pages_dir: 'html/',
	lang: '',
	straight: true,
	score_by_progress: false,
	score_max: 100,
	score_min: 0,
}
```

debug: Set the display of debug information in the browser console. The values are none, error, log, all.

min_time_per_page: Prevent the advance before the minimum time is reached. If the page has already been seen before is setting is not applied.

resume_prompt: If set to TRUE, allows the student to access the lesson choose whether to start where you left off or go to the first screen of course.

protect_images: Allows block right click and drag commands.

limit_video_access: Prevent viewing videos after X views (views during the same session are ignored). The counting of the videos is individual, and the count is incremented after confirmation of the student.

pages_dir: Folder containing html files for each menu item.

lang: Allows internationalize the course. A folder within the html folder should be created with the language selected in this configuration (eg html / en_US / aula1.html). The file containing the course of the menu should be appointed as the menu_pt_BR.xml Convention.

straight: If set to TRUE, prevents the student to jump course pages.

score_by_progress: Allows scoring the student based on the percentage of progress even in the course. If other scoring metrics are used, this option can remain FALSE. The value of the student's score will be within the score_min and score_max limits.

score_max: Maximum possible score for this course.

score_min: minimum possible score for this course.

Hooks
==============================

In principle it is not necessary to edit the Manager.min.js file by simply using hooks in the code as shown below:

start_manager: Runs after the call Manager.Core.begin();

load_scorm: Run to start the connectivity with the SCORM API or when the test mode is active;

before_generate_menu: Runs before downloading the menu.xml;

menu_generated_ok: Runs after the HTML menu is generated and inserted;

menu_generated_error: Runs after failure in processing the menu;

on_ready: Runs after interface be ready for use;

on_tick: Runs every second;

choose_page: Runs after choosing a page of the course, and before validation (dependencies, minimum time, etc.); page_not_allowed: Executes after a dependence have been found. The dependence prevents a page is seen before the previous field;

before_page_load: Runs after validation and before downloading the new page;

after_page_load: Runs after new page has been displayed and visited pages catalog have been updated;

page_loaded_error: Runs after the new page load error;

page_loaded_ok: Runs after new page has been displayed;

before_close_scorm: Runs before the final save commands, to close the page of the course;

end_manager: Runs after all tasks are completed. No more communication with backend at this point because the SCORM API has received the shutdown command;

course_complete: Runs when the course reaches 100%. Only run once;

first_page: Runs when the person is the first page and use the back button;

last_page: Runs when the person is on the last page and use the Next button;

before_pack_data: Runs before the serialization of data;

sd_high_volume_data: TEXT field limit (in Moodle DB) is ~ 64 thousand characters. This hook runs when more than 90% of the limit has been reached;

after_pack_data: Runs after serialization of data and sd_high_volume_data check;

after_console_message: Executes after a message is sent to the browser console;

before_protect: Runs before the content protection controls;

before_protect_video: Runs before the video is protected;

after_protect_video: Runs after video be protected;

on_play_video: Run by clicking the watch_video command;
