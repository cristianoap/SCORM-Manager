(function(W){
Manager = {};
W.Manager = Manager;
manager = function (arg) {
	this.Scorm = pipwerks.SCORM;
	this.startTime = (new Date).getTime();
	this.finishTime = 0;
	$M = arg;
	//teste
	if(!(this instanceof manager)){ 
		return new manager(arg); 
	}
};
manager.fn = manager.prototype;
if(!String.prototype.format) {
	String.prototype.format = function () {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] !== 'undefined' ? args[number] : match;
		});
	};
}
if(!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$M/g, '');
		// return this.replace(/^\s+|\s+jQuery/g, '');
	};
}
manager.fn.I18n = {
	strings: {
		pt_BR: {
			first_page: "Primeira p\u00e1gina",
			last_visited: "\u00daltima visitada",
			message: "Mensagem",
			close: "Fechar",
			connection_lost: 'Perda de conectividade, por favor feche esta janela e acesse esta atividade novamente',
			xml_menu_error: 'Erro fatal, cheque a estrutura de menu.xml',
			in_first_page: 'Você está na primeira página',
			in_last_page: 'Você está na última página',
			time_gt: 'Aguarde pelo menos {0} segundos antes de avançar',
			must_see: 'Para ver esta página, você precisa ver primeiro',
			connection_lost_try_again: 'Perda de conectividade, por favor tente novamente',
			where_go: 'Foi identificado que você já visualizou algumas páginas, para qual página você deseja ir?',
			refresh_page: 'Se esta janela estiver demorando para carregar, atualize a página',
			welcome: 'Bem vindo',
			video_noquota: 'Você atingiu a cota deste vídeo',
			video_remaining_quota: 'Você ainda pode ver este vídeo',
			watch_video: 'Assistir vídeo',
			copy: 'Copiar',
			copy_that: 'Copiado! Agora nos envie uma mensagem com este texto.',
			error_report: 'Copie o conteúdo da caixa de texto abaixo e nos envie, assim poderemos entender melhor o problema que o impede de acessar seu conteúdo.'
		},
	},
	__: function(str) {
		var l = manager.fn.Settings == undefined || manager.fn.Settings.lang == ''  ? 'pt_BR':  manager.fn.Settings.lang;
		if(eval('manager.fn.I18n.strings.{0}.hasOwnProperty(str)'.format(l))){
			return eval('manager.fn.I18n.strings.{0}.{1}'.format(l, str));
		} else {
			return str;
		}
	},
	translate: function(s) {
		this.strings = s;
	}
};
window.__ = manager.fn.I18n.__;
_close_action = function () {
	$M("#conteudo").fadeTo("fast", 1, function () {
		$M(".ui-icon-closethick").unbind("click.close");
		$M(".ui-icon-closethick").trigger("click")
	}); 
	$M("body").css({
		"background-image": "url(imagem/loading.gif)",
		"background-position": "center center",
		"background-repeat": "no-repeat"
	});
	$M("#pagina").show();
	$M("#big_cover").hide();
	return false;
};
_open_action = function () {
	$M("#big_cover").show();
	$M("#pagina").hide();
	$M("body").css("background-image", "url(imagem/dialog_bg.png)");
	$M("#conteudo").fadeTo("fast", 0);
	$M(".ui-dialog").on("keydown", function (evt) {
		if(evt.keyCode === $M.ui.keyCode.ESCAPE)
			$M(".ui-icon-closethick").trigger("click");
		evt.stopPropagation();
	});
	$M(".ui-icon-closethick").bind("click.close", _close_action);
};

//https://developers.google.com/chrome-developer-tools/docs/console?hl=pt-br#accessing_recently_selected_elements_and_objects
manager.fn.Settings = {
	debug: 'none',
	min_time_per_page: 0,
	resume_prompt: true,
	protect_images: true,
	limit_video_access: true,
	first_access_prompt: false,
	pages_dir: 'html/',
	lang: '',
	straight: true,
	score_by_progress: false,
	score_max: 100,
	score_min: 0,
	dialog_config: {
		resume: {
			autoOpen: true,
			width: 400,
			closeOnEscape: false,
			open: _open_action,
			close: _close_action,
			buttons: [{
				text: __('first_page'),
				click: function () {
					Manager.Core.Navigation.load_page(Manager.Core.Data.Session.Navigation.Pages[0]);
					$M("#conteudo").fadeTo("slow", 1);
					$M(this).dialog("close");
				}
			}, {
				text: __('last_visited'),
				click: function () {
					Manager.Core.Navigation.load_page(Manager.Core.Navigation.get_lesson_location());
					$M("#conteudo").fadeTo("slow", 1);
					$M(this).dialog("close");
				}
			}]
		},
		ok: {
			autoOpen: true,
			width: 400,
			closeOnEscape: false,
			open: _open_action,
			close: _close_action,
			buttons: [{
				text: "OK",
				click: function () {
					$M("#conteudo").fadeTo("slow", 1);
					$M(this).dialog("close");
				}
			}]
		},
		close: {
			autoOpen: true,
			width: 400,
			closeOnEscape: false,
			open: _open_action,
			close: _close_action,
			buttons: [{
				text: __('close'),
				click: function () {
					parent.close();
				}
			}]
		}
	}
};
manager.fn.Core = {
	begin: function (t) {
		test = t;
		//aqui começa
		Manager.Core.Workflow.momentum('start_manager', t);
		if(Manager.Scorm.init() || test) {
			Manager.Core.Workflow.momentum('load_scorm');
			Manager.Core.Navigation.generate_menu();
			window.onunload = Manager.Core.end;
			window.beforeonunload = Manager.Core.end;
			Manager.Core.unloaded = false;
			return true;
		}
		Manager.Info.alert(__('connection_lost'), Manager.Settings.dialog_config.close);
		Manager.Core.terminate();
		return false;
	},
	end: function () {
		//aqui termina
		if(!Manager.Core.unloaded) {
			Manager.Core.Workflow.momentum('before_close_scorm');
			Manager.Core.Timer.save();
			Manager.Core.Data.commit();
			Manager.Scorm.quit();
			Manager.Core.Workflow.momentum('end_manager');
			return true;
		}
		Manager.Core.unloaded = true;
	},
	start_over: function(){
		window.reload();
	},
	terminate: function(){
		Manager.Core.Timer.stop();
		Manager.Core.Workflow.empty();
		Manager.Core.unloaded = true;
		Manager.Core.Session.ready = false;
	},
	obfuscate : function(){
		Object.prototype.valueOf = Manager.Core.obfuscate;
		Object.prototype.toString = Manager.Core.obfuscate;
	//	Object.prototype.constructor = Manager.Core.obfuscate;
		return '=P';
	},
	Utils: {
		toJSON: function(s){
			Manager.Core.Workflow.momentum('toJSON', s);
			return $M.stringify(s);
		},
		toObject: function(s){
			Manager.Core.Workflow.momentum('toObject', s);
			return eval('v = ' + s);
		}
	},
	Timer: {
		_clock: null,
		session_time: 0,
		page_time: 0,
		start: function () {
			Manager.Core.Timer._clock = setInterval(this.tick, 1000);
			Manager.Info.log('Timer started');
		},
		stop: function () {
			// clearInterval(Manager.Core.Timer.session_time);
			// Manager.Core.Timer.session_time = undefined;
			// clearInterval(Manager.Core.Timer.tick);
			clearInterval(Manager.Core.Timer._clock);
			Manager.Core.Timer.page_time = 0;
			Manager.Core.Timer.session_time = 0;
			Manager.Info.log('Timer stopped');
		},
		tick: function () {
			Manager.Core.Timer.session_time += 1;
			Manager.Core.Timer.page_time += 1;
			if(Manager.Core.Data.Session.ready === undefined || !Manager.Core.Data.Session.ready) {
				Manager.Core.Timer.ready();
			}
			Manager.Core.Workflow.momentum('on_tick', Manager.Core.Timer.page_time, Manager.Core.Timer.session_time);
		},
		ready: function () {
			if(Manager.Core.Data.Session.ready === undefined || !Manager.Core.Data.Session.ready) {
				if(Manager.Core.Timer.session_time >= 10) {
					Manager.Info.alert(__('connection_lost'), Manager.Settings.dialog_config.close);
					Manager.Info.error('Connection lost, need refresh');
					Manager.Core.Timer.stop();
					return false;
				}
			}
		},
		format: function(){
			var s = Manager.Core.Timer.session_time;
			var m = 0;
			var h = 0;
			while(s >= 60) {
				++m;
				s -= 60;
				if(m >= 60) {
					m = 0;
					++h;
				}
			}
			if(h < 10) {
				h = "0" + h;
			}
			if(m < 10) {
				m = "0" + m;
			}
			if(s < 10) {
				s = "0" + s;
			}
			var f = '0{0}:{1}:{2}.0'.format(h, m, s);
			return f;
		},
		save: function () {
			Manager.Scorm.set("cmi.core.session_time", Manager.Core.Timer.format());
			this.session_time = 0;
			if(Manager.Core.Data.commit()){
				Manager.Info.log('Timer recorded');
			}
		},
		check_time_per_page: function(p){
			var t = Manager.Core.Data.Session.min_time_per_page;
			if(t === undefined) {
				t = Manager.Settings.min_time_per_page;
				Manager.Core.Data.Session.min_time_per_page = t;
				Manager.Settings.min_time_per_page = t;
			}
			if(t > Manager.Core.Timer.page_time) {
				return true;
			}
			else {
				// Manager.Core.Timer.page_time = 0;
				return false;
			}
		},
	},
	Workflow: {
		works: [],
		execute: function (m, args) {
			var ar = [];
			for(var i in args) {
				eval('var _' + i + ' = args[i]');
				ar.push('_' + i);
			}
			var argsS = ar.join(',');
			for(var func in Manager.Core.Workflow.works[m]) {
				var fn = Manager.Core.Workflow.works[m][func];
				eval('fn(' + argsS + ')');
			}
		},
		clean_stack: function(m){
			Manager.Core.Workflow.works[m] = undefined;
			return Manager.Core.Workflow.works[m] === undefined;
		},
		reset: function(){
			Manager.Core.Workflow.works = [];
		},
		momentum: function (m) {
			var argsA = [];
			for (var k in arguments) {
				if (parseInt(k) > 0) {
					argsA.push(arguments[k]);
				}
			}
			//executa pilha padrao
			switch(m) {
				case 'start_manager':
					Manager.Core.obfuscate();
					Manager.Info.log('Waking');
					break;
				case 'load_scorm':
					Manager.Core.Data.unpack();
					break;
				case 'menu_generated_ok':
					Manager.Info.log('Menu generated');
					if(Manager.Core.Data.Session.ready == undefined || !Manager.Core.Data.Session.ready){
						Manager.Core.Workflow.momentum('on_ready', (new Date).getTime());
					}
					break;
				case 'on_ready':
					Manager.Core.Data.Session.ready = true;
					Manager.Info.log('Ready');
					Manager.Core.Navigation.check_first_access();
					Manager.Core.Timer.start();
					Manager.finishTime = argsA[0];
					break;
				case 'on_tick':
					break;
				case 'before_commit_data':
					Manager.Core.Data.pack();
					break;
				case 'choose_page':
					break;
				case 'after_page_load':
					break;
				case 'page_loaded_error':
					break;
				case 'page_loaded_ok':
					var p = Manager.Core.Data.Session.protect_images;
					if(p === undefined) {
						Manager.Core.Data.Session.protect_images = Manager.Settings.protect_images;
						p = Manager.Core.Data.Session.protect_images;
					}
					else {
						Manager.Settings.protect_images = Manager.Core.Data.Session.protect_images;
						Manager.Core.Data.Session.protect_images = undefined;
					}
					var v = Manager.Core.Data.Session.limit_video_access;
					if(v === undefined) {
						Manager.Core.Data.Session.limit_video_access = Manager.Settings.limit_video_access;
						v = Manager.Core.Data.Session.limit_video_access;
					}
					else {
						Manager.Settings.limit_video_access = Manager.Core.Data.Session.limit_video_access;
						Manager.Core.Data.Session.limit_video_access = undefined;
					}
					if(p) {
						Manager.Media.Images.protect();
					}
					if(v) {
						Manager.Media.Videos.protect();
					}
					Manager.Core.Navigation.set_lesson_location();
					Manager.Core.Data.commit();
					Manager.Info.log('Page loaded - ' + Manager.Core.Data.Session.current_page.titulo);
					break;
				case 'before_close_scorm':
					if(Manager.Settings.score_by_progress !== undefined && Manager.Settings.score_by_progress) {
						Manager.Scorm.set('cmi.core.score.raw', Manager.Core.Data.suspend_data.pages.progress);
						Manager.Scorm.set('cmi.core.score.max', Manager.Settings.score_max);
						Manager.Scorm.set('cmi.core.score.min', Manager.Settings.score_min);
						Manager.Core.Data.commit();
					}
					break;
				case 'end_manager':
					Manager.Info.log('Bye');
					break;
				case 'course_complete':
					break;
				case 'after_pack_data':
					break;
				case 'sd_high_volume_data':
					// Manager.Core.Utils.gc('b');
					break;
				case 'first_page':
					break;
				case 'last_page':
					break;
				case 'after_console_message':
					break;
			}
			//executa pilha do usuario
			return Manager.Core.Workflow.execute(m, argsA);
		},
		attach: function (momentum, func_ref) {
			if(momentum !== undefined && func_ref !== undefined) {
				Manager.Core.Workflow.works[momentum] = Manager.Core.Workflow.works[momentum] !== undefined ? Manager.Core.Workflow.works[momentum] : [];
				Manager.Core.Workflow.works[momentum].push(func_ref);
				return {
					'index' : Manager.Core.Workflow.works[momentum].length - 1,
					'momentum': momentum,
					'func' : func_ref
				};
			}
			else {
				return false;
			}
		},
		detach: function (momentum, func_ref) {
			if(momentum !== null && momentum !== undefined) {
				if(typeof momentum === 'object') {
					var func_ref = momentum.func;
					var momentum = momentum.momentum;
				}
				if(func_ref !== undefined && Manager.Core.Workflow.works[momentum] === undefined) {
					Manager.Info.error('Momentum dont exists');
					return false;
				}
				var list = [];
				var cleared = false;
				for(var func in Manager.Core.Workflow.works[momentum]) {
					var fn = Manager.Core.Workflow.works[momentum][func];
					list.push(fn);
					if($M.stringify(fn) === $M.stringify(func_ref)) {
						list.pop();
						cleared = true;
					}
				}
				Manager.Core.Workflow.works[momentum] = list;
				if(!cleared){
					Manager.Info.error('Function dont exists in workflow schedule - ' + func_ref);
					return false;
				}
				return true;
			}
			else {
				return false;
			}
		}
	},
	Data: {
		commit: function () {
			if(Manager.Core.Workflow.momentum('before_commit_data')){
				if(Manager.Scorm.save()) {
					Manager.Info.log('Data saved');
					return true;
				}
				else {
					Manager.Info.error('Saving operation failed - you are offline?');
					return false;
				}
			}
		},
		pack: function () {
			Manager.Core.Workflow.momentum('before_pack_data');
			var v = $M.stringify(Manager.Core.Data.suspend_data);
			var db_max = 64000; //max size allowed in moodle db
			var suspend_size = v.length / db_max;
			Manager.Core.Data.suspend_data.size = suspend_size * 100 + '%';
			if(suspend_size >= .9) {
				Manager.Core.Workflow.momentum('sd_high_volume_data', suspend_size);
			}
			Manager.Core.Workflow.momentum('after_pack_data');
			return Manager.Scorm.set("cmi.suspend_data", v);
		},
		unpack: function () {
			Manager.Core.Workflow.momentum('before_unpack_data');
			var value = Manager.Scorm.get("cmi.suspend_data");
			if(value === 'null' || value === '' || test) {
				value = '{"media":{"videos":[],"images":[]},"pages":{"visited": []},"quizzes":[],"info":{},"size":0}';
				Manager.Info.log('Loading skeleton - test mode or first access');
			} else{
				Manager.Info.log('Data loaded');
			}
			Manager.Core.Data.suspend_data = eval('v=' + value);
			Manager.Core.Data.suspend_data.pages = Manager.Core.Data.suspend_data.pages !== undefined ? Manager.Core.Data.suspend_data.pages : {};
			Manager.Core.Data.suspend_data.pages.visited = Manager.Core.Data.suspend_data.pages.visited !== undefined ? Manager.Core.Data.suspend_data.pages.visited : [];
			
			return true;
		},
		Session: {
			session_info: {
				viewed_videos: []
			},
			current_page: {},
			last_page: {},
			Navigation: {}
		}
	},
	Navigation: {
		generate_menu: function () {
			Manager.Core.Workflow.momentum('before_generate_menu');
			$M("#menu-tree").empty();
			$M.ajax({
				type: "GET",
				url: Manager.Settings.lang !== '' ? "menu_{0}.xml".format(Manager.Settings.lang) : "menu.xml",
				dataType: "xml",
				async: false,
				success: function (xml) {
					var j = 0;
					var t = 0;
					var nav = Manager.Core.Data.Session.Navigation;
					nav.Groups = {};
					nav.Pages = {};
					$M(xml).find("grupo").each(function (i) {
						t++;
						var list = new Array();
						var group = $M(this);
						$M(group).find("item").each(function (index) {
							var dps = $M(this).attr("dependencias") !== undefined ? $M(this).attr("dependencias").split(',') : [];
							if(dps.length > 0) {
								for(var i in dps) {
									dps[i] = dps[i].trim();
								}
							}
							var item = {
								'titulo': $M(this).attr("titulo") !== undefined ? $M(this).attr("titulo") : 'Sem titulo',
								'id': j,
								'group_id': t - 1,
								'url': $M(this).attr("arquivo") !== undefined ? $M(this).attr("arquivo") : 'Sem link',
								'icone': $M(this).attr("icone") !== undefined ? $M(this).attr("icone") : 'newspaper',
								'deps': dps,
								'viewed': false
							};
							list[index] = item;
							nav.Pages[j] = item;
							j++;
						});
						nav.Groups[i] = {
							'id': i,
							'titulo': $M(group).attr("titulo") !== undefined ? $M(this).attr("titulo") : 'Sem titulo',
							'icone': $M(this).attr("icone") !== undefined ? $M(this).attr("icone") : 'house',
							'items': list,
						};
						var titulo = nav.Groups[i].titulo;
						var ulId = titulo.replace(" ", "").replace(/[_\s]/g, "");
						var icon = nav.Groups[i].icone;
						$M("#menu-tree").append(
							'<ul class="menu" style="display:none" id="{0}"><li class="titulo" style="background:url(imagem/icones/toggle_minus.png);background-position: 0px center;background-repeat:no-repeat"><img src="imagem/icones/{1}.png"/>{2}</li></ul>'
							.format(ulId, icon, titulo));
					});
					if(j == 0 || t == 0){
						Manager.Info.alert(__('xml_menu_error'), Manager.Settings.dialog_config.close);
						Manager.Info.error('fatal error - menu.xml must be like <dados><grupo><item/></grupo><dados>');
						return false;
					}
					Manager.Core.Data.Session.Navigation.total_items = j;
					j = 0;
					for(var z = 0; z < t; z++) {
						var ulId = "#" + nav.Groups[z].titulo.replace(" ", "").replace(/[_\s]/g, "");
						var l = nav.Groups[z].items.length;
						for(var y = 0; y < l; y++) {
							var icon = nav.Groups[z].items[y].icone;
							var titulo = nav.Groups[z].items[y].titulo;
							var page = nav.Groups[z].items[y].url;
							var node_icon = y === l - 1 ? 'lastnode' : 'node';
							$M(ulId).append(
								'<li class="item"><img src="imagem/icones/{0}.png"/><img src="imagem/icones/{1}.png" class="icon{2}"/><a href="#" id="li_{2}" page="{3}">{4}</a></li>'
								.format(node_icon, icon, j, page, titulo));
							if($M(ulId).has("li .item")) {
								$M(ulId).css("display", "block");
								$M(ulId + " li").css("display", "block");
							}
							$M('#li_' + j).data('page', nav.Groups[z].items[y]);
							var v = Manager.Core.Data.suspend_data.pages.visited;
							for(var a = 0; a < v.length; a++) {
								if(page === v[a]) {
									$M(".item .icon" + j).attr('src', 'imagem/li_1.png');
									nav.Groups[z].items[y].viewed = true;
									nav.Pages[j].viewed = true;
								}
							}
							j++;
						}
						if(Manager.Settings.straight !== undefined && Manager.Settings.straight !== null && Manager.Settings.straight) {
							for(var b in nav.Pages) {
								if(nav.Pages[b].deps.length === 0) {
									if(b > 1) {
										nav.Pages[b].deps.push(nav.Pages[parseInt(b) - 1].url);
									}
								}
							}
						}
						$M(ulId + " li.titulo").data('state', 'opened');
					}
					Manager.Core.Workflow.momentum('menu_generated_ok');
				},
				error: function (r) {
					Manager.Info.alert(__('connection_lost'), Manager.Settings.dialog_config.close);
					Manager.Info.error('Menu generation fail');
					Manager.Core.Workflow.momentum('menu_generated_error', r);
				}
			});
		},
		check_dependencies: function (p) {
			if(!p.viewed && p.deps.length > 0) {
				var pages = Manager.Core.Data.Session.Navigation.Pages;
				var visited = Manager.Core.Data.suspend_data.pages.visited;
				var locked = [];
				for(var i in p.deps) {
					for(var el in pages) {
						if(!pages[el].viewed && p.deps[i] === pages[el].url) {
							var x = document.createElement('a');
							x = $M(x).attr('data-page', $M.stringify(pages[el]));
							x.html(pages[el].titulo);
							x.attr('href', '#');
							x.addClass('toview');
							var s = '<span class="item">{0}</span>'.format(x[0].outerHTML);
							locked.push(s);
						}
					}
				}
				if(locked.length > 0) {
					var msg = '<div id="cxprincp"><h3>{0} <span class="locklist">{1}</span></h3></div>'.format(__('must_see'), locked.join(', '));
					$M("#conteudo").html(msg);
					Manager.Core.Data.Session.last_page = Manager.Core.Data.Session.current_page;
					Manager.Core.Data.Session.current_page = p;
					Manager.Info.log('Page not allowed yet');
					Manager.Core.Workflow.momentum('page_not_allowed', p);
					return false;
				}
			}
			return true;
		},
		forward: function () {
			var p = Manager.Core.Data.Session.Navigation.Pages[Manager.Core.Data.Session.current_page.id + 1];
			if(p === undefined) {
				Manager.Info.alert(__('in_last_page'));
				Manager.Core.Workflow.momentum('last_page');
				return false;
			}
			Manager.Core.Navigation.load_page(p);
		},
		backward: function () {
			var p = Manager.Core.Data.Session.Navigation.Pages[Manager.Core.Data.Session.current_page.id - 1];
			if(p === undefined) {
				Manager.Info.alert(__('in_first_page'));
				Manager.Core.Workflow.momentum('first_page');
				return false;
			}
			Manager.Core.Navigation.load_page(p);
		},
		set_lesson_status: function () {
			if(Manager.Scorm.set("cmi.core.lesson_status", 'completed')) {
				Manager.Core.Workflow.momentum('course_complete', (new Date));
				return Manager.Core.Data.commit();
			}
		},
		set_lesson_location: function () {
			//salva a ultima pagina visualizada
			if(Manager.Scorm.set("cmi.core.lesson_location", $M.stringify(Manager.Core.Data.Session.current_page))) {
				return Manager.Core.Data.commit();
			}
		},
		get_lesson_location: function () {
			var l = Manager.Scorm.get("cmi.core.lesson_location");
			r = test || l === '' || l === 'null' ? Manager.Core.Data.Session.Navigation.Pages[0] : eval('v=' + l);
		//	Manager.Core.Data.Session.current_page = r;
			return r;
		},
		load_page: function (p) {
			Manager.Core.Workflow.momentum('choose_page', p);
			if(p === undefined || p === null) {
				Manager.Info.alert(__('invalid_location'));
				Manager.Info.error('invalid local');
				return false;
			}
			if(p === Manager.Core.Data.Session.current_page) {
				Manager.Info.log('Same page - nothing to do');
				return false;
			}
			var pg = Manager.Core.Data.Session.Navigation;
			if(!Manager.Core.Navigation.check_dependencies(p)){
				return;
			}
			if(p.id > Manager.Core.Data.Session.current_page.id && Manager.Core.Timer.check_time_per_page(p)) {
				var t = Manager.Core.Data.Session.min_time_per_page;
				Manager.Info.alert(__('time_gt').format(t), Manager.Settings.dialog_config.ok);
				return false;
			}
			Manager.Core.Workflow.momentum('before_page_load', p.id);
			$M("#conteudo").fadeOut("slow", null, function () {
				var reqTime = (new Date).getTime();
				$M.ajax({
					type: "GET",
					url: '{0}/{1}/{2}.html'.format(Manager.Settings.pages_dir, Manager.Settings.lang, p.url),
					dataType: "html",
					cache: true,
					success: function (data) {
						var delta = (new Date).getTime() - reqTime;
						Manager.Core.Timer.page_time = 0;
						var session = Manager.Core.Data.Session;
						session.Navigation.Pages[p.id].viewed = true;
						session.last_page = session.current_page;
						session.current_page = p;
					//	$M("body").css("background-image", "none");
						$M("#conteudo").html(data);
						Manager.Core.Workflow.momentum('page_loaded_ok', delta);
					},
					error: function (r) {
						var delta = (new Date).getTime() - reqTime;
						Manager.Core.Workflow.momentum('page_loaded_error', delta);
						Manager.Info.alert(__('connection_lost_try_again'), Manager.Settings.dialog_config.ok);
					}
				});
				var o = Manager.Core.Data.suspend_data.pages.visited;
				var y = false;
				for(var a = 0; a < o.length; a++) {
					if(o[a] === p.url) {
						y = true;
					}
				}
				if(!y) {
					Manager.Core.Data.suspend_data.pages.visited.push(p.url);
				}
			});
			Manager.Core.Workflow.momentum('after_page_load');
		},
		check_first_access: function () {
			var e = Manager.Scorm.get("cmi.core.entry");
			switch(e) {
			case 'resume':
				if(Manager.Settings.dialog_config.resume !== null && Manager.Settings.resume_prompt){
					Manager.Info.alert(__('where_go'), Manager.Settings.dialog_config.resume);
				}
				Manager.Info.log('Attempt - ' + e);
				break;
			case 'ab-initio':
				if(Manager.Settings.dialog_config.ok !== null) {
					if(!Manager.Settings.first_access_prompt) {
						$M("#dialog").dialog(__('welcome'), Manager.Settings.dialog_config.ok);
					}
					else {
						Manager.Core.Navigation.load_page(Manager.Core.Data.Session.Navigation.Pages[0]);
					}
				}
				Manager.Info.log('Attempt - ' + e);
				break;
			default:
				Manager.Info.error('Unrecognized cmi.core.entry value - ' + e);
				Manager.Core.Navigation.load_page(Manager.Core.Data.Session.Navigation.Pages[0]);
				Manager.Scorm.set("cmi.core.entry", 'resume');
				Manager.Core.Data.commit();
				break;
			}
		}
	}
};
manager.fn.Info = {
	messages_stack: [],
	messages_stack_o: [],
	alert: function (m, c) {
		if(c === undefined) {
			var c = Manager.Settings.dialog_config.ok;
		}
		$M("#dialog").attr('title', __('message')).html(m).dialog(c);
	},
	log: function (t) {
		if(Manager.Settings.debug === 'log' || Manager.Settings.debug === 'error' || Manager.Settings.debug === 'all') {
			if(console !== undefined && console.log) {
				console.log(t);
			}
			else {
				alert(t);
			}
			var msg_obj = {
				type: 'log',
				message: t,
				'time': new Date()
			};
			if(Manager.Info.messages_stack_o['log'] === undefined){
				Manager.Info.messages_stack_o['log'] = [];
			}
			Manager.Info.messages_stack.push(msg_obj);
			Manager.Info.messages_stack_o['log'].push(msg_obj);
			Manager.Core.Workflow.momentum('after_console_message');
		}
	},
	error: function (t) {
		if(Manager.Settings.debug === 'error' || Manager.Settings.debug === 'all') {
			if(console !== undefined && console.error) {
				console.error(t);
			}
			else {
				alert(t);
			}
			var msg_obj = {
				type: 'error',
				message: t,
				'time': new Date()
			};
			if(Manager.Info.messages_stack_o['error'] === undefined){
				Manager.Info.messages_stack_o['error'] = [];
			}
			Manager.Info.messages_stack.push(msg_obj);
			Manager.Info.messages_stack_o['error'].push(msg_obj);
			Manager.Core.Workflow.momentum('after_console_message');
		}
	},
	get_messages: function(type){
		if(type === undefined || Manager.Info.messages_stack_o[type] === undefined){
			return Manager.Info.messages_stack;
		}
		return Manager.Info.messages_stack_o[type];
	},
	error_report: function(){
		if (prompt(__('error_report'), $M.stringify(Manager.Info.messages_stack))){
			// Manager.Info.log('Error report copy that');
		}
	},
	about: {
		author: 'Cristiano AP',
		facebook: 'cristiano.albano.pereira',
		version: '3.5',
	}
};
manager.fn.Media = {
	Videos: {
		protect: function () {
			Manager.Core.Workflow.momentum('before_protect');
			var iframes = $M('iframe');
			var block =
				'<div class="video_cover"><p>{0} <span class="turns">5</span>x</p><div align="center" class="progress"><div class="progress_bar"></div></div><span> <a href="#" role="button">{1}</a> </span> </div>'.format(__('video_remaining_quota'), __('watch_video'));
			var blockfull =
				'<div class="video_cover"><p>{0}</p><div align="center" class="progress"><div class="progress_bar"></div></div></div>'.format(__('video_noquota'));
			iframes.each(function (index) {
				var me = $M(this);
				Manager.Core.Workflow.momentum('before_protect_video', me);
				var me_url = me.attr('src');
				var container = me.parent();
				container.addClass('video_container');
				var sd_videos = Manager.Core.Data.suspend_data.media.videos;	
				var viewed = Manager.Core.Data.Session.session_info.viewed_videos;	
				var p = Manager.Core.Data.Session.current_page;
				sd_videos[p.url] = sd_videos[p.url] !== undefined ? sd_videos[p.url] : [];
				sd_videos[p.url][index] = sd_videos[p.url][index] !== undefined ? sd_videos[p.url][index] : 0;
				viewed[p.url] = viewed[p.url] !== undefined ? viewed[p.url] : [];
				viewed[p.url][index] = viewed[p.url][index] !== undefined ? viewed[p.url][index] : false;
				Manager.Core.Data.suspend_data.media.videos = sd_videos;
				Manager.Core.Data.Session.session_info.viewed_videos = viewed;	
				if(viewed[p.url][index]){
					//checar se comporta varios videos na mesma pagina
					return;
				}
				// var turns = sd_videos[p.url][index] !== undefined ? sd_videos[p.url][index] : 0;
				var turns = sd_videos[p.url][index];
				var max = Manager.Core.Data.Session.max_videos;
				if(max === undefined) {
					Manager.Core.Data.Session.max_videos = max_videos;
					max = Manager.Core.Data.Session.max_videos;
					max_videos = undefined;
				}
				var has_quota = turns < max;
				if(has_quota) {
					container.html(block + container.html());
				}
				else {
					container.html(blockfull);
				}
				Manager.Core.Workflow.momentum('after_protect_video', me, turns, has_quota);
				var center = ((container.width() - $M(this).attr('width')) / 2) > 0 ? ((container.width() - $M(this).attr('width')) / 2) : (($M('body').width() - $M(this).attr('width')) / 2) - 9;
				container.find('.turns').html(max - turns);
				container.find('.video_cover')
					.data('sn', index)
					.width($M(this).attr('width'))
					.height($M(this).attr('height'))
					.css('left', center);
				var pc = 100 - turns / max * 100;
				container.find('.progress_bar')
					.css({
						'width': "100%",
						'height': '100%'
					})
					.delay(750)
					.animate({width: pc + "%"}, 'slow');
				$M('.video_cover').delegate('a', 'click', function () {
					var me = $M(this);
					var container = me.parent().parent();
					var video = container.parent().find('iframe');
					container.slideUp();
					var p = Manager.Core.Data.Session.current_page;
					var viewed = Manager.Core.Data.Session.session_info.viewed_videos;	
					var sd_videos = Manager.Core.Data.suspend_data.media.videos;	
					var index = parseInt(container.data('sn'));
					var sn = parseInt(sd_videos[p.url][index]);
					var n = !isNaN(sn) && sn !== undefined ? sn : 0;
					n = viewed[p.url][sn] ? n : ++n;
					viewed[p.url][index] = true;
					sd_videos[p.url][index] = n;
					Manager.Core.Data.suspend_data.media.videos = sd_videos;
					Manager.Core.Data.Session.session_info.viewed_videos = viewed;	
					Manager.Core.Workflow.momentum('on_play_video', video, n);
				});
			});
		}
	},
	Images: {
		protect: function () {
			$M('#conteudo').not('input, form *, textarea, select').on('contextmenu drag startdrag mousedown', function(){
					return false;
				}
			)
		}
	}
};
manager.fn.Quizzes = {
	set_score: function (v) {
		Manager.Scorm.set("cmi.score.raw", v);
		Manager.Core.Data.commit();
	},
	set_answers: function(q, a){
		if(q === undefined || a === undefined) {
			Manager.Info.error('Mandatory params - q and a');
			return false;
		}
		var p = Manager.Core.Data.Session.current_page;
		Manager.Core.Data.suspend_data.quizzes[p.url] = Manager.Core.Data.suspend_data.quizzes[p.url] !== undefined ? Manager.Core.Data.suspend_data.quizzes[p.url] : {};
		Manager.Core.Data.suspend_data.quizzes[p.url][q] = a;
		Manager.Info.console('Question added in page {0}, with {1} = {2}'.format(p.titulo, q, a));
		return true;
	},
	get_answers: function(q){
		if(q === undefined || a === undefined) {
			Manager.Info.error('Mandatory params - q');
			return false;
		}
		var p = Manager.Core.Data.Session.current_page;
		Manager.Core.Data.suspend_data.quizzes[p.url] = Manager.Core.Data.suspend_data.quizzes[p.url] !== undefined ? Manager.Core.Data.suspend_data.quizzes[p.url] : undefined;
		if(Manager.Core.Data.suspend_data.quizzes[p.url] === undefined){
			Manager.Info.error('This page dont have questions');
			return false;
		}
		Manager.Info.console('Questions loaded');
		return Manager.Core.Data.suspend_data.quizzes[p.url][q];
	},
};

var max_videos = 5;
test = false;
teste = true;
Manager = new manager(jQuery);
SCOManager = Manager;
})(window)
jQuery('#timout_message').html('');
jQuery('#timout_message').delay(5000).html(__('refresh_page'));

jQuery(document).ready(function($){
	//mover esse elemento para o html
	// jQuery('body').append(
		// jQuery('<div id="big_cover"></div>').css({
			// "background-image": "url(imagem/loading.gif)",
			// "background-position": "center center",
			// "background-repeat": "no-repeat",
			// "position": "absolute",
			// "width": "100%",
			// "height": "100%"
		// }).html('<div id="timout_message" style="text-align:center">{0}</div>'.format(__('refresh_page')))
	// );
});

Manager.Core.Workflow.attach('on_ready', function(){
	// jQuery('#big_cover').hide();
	jQuery('#big_cover').css('z-index', 0);
});
Manager.Core.Workflow.attach('page_loaded_ok', function(){
	jQuery("#conteudo").fadeIn("slow");
});
