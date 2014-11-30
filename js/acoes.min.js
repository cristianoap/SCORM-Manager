var swipe = [];
var mouseDown = false;
$(document).ready(function () {
	$("#menu-tree").on('click', '.item a', function () {
		Manager.Core.Navigation.load_page($(this).data('page'));
	});
	$("#conteudo").on('click', 'a.toview', function () {
		Manager.Core.Navigation.load_page(eval('v=' + $(this).attr('data-page')));
	});
	$("#avancar").on('click', function () {
		Manager.Core.Navigation.forward();
	});
	$("#voltar").on('click', function () {
		Manager.Core.Navigation.backward();
	});
	if($(document).width() < 800){
		//Manager.Info.alert('Use o menu, os botões ou arraste na tela para mudar de página.');
		$("#conteudo ").on("mousedown", function(event) {
			if(event.button == 0){
				mouseDown = true;
				swipe['x'] = event.pageX;
				setTimeout(function(){
					mouseDown = false;
				}, 1000);
			}
		}).on("mouseup", function(event) {
			if(mouseDown){
				if(swipe['x'] + 50 < event.pageX){
					$('#voltar').trigger('click');
				} else if(swipe['x'] > event.pageX + 50){
					$('#avancar').trigger('click');
				}
			}
		});
	}
	$("#sessao").on('click', function () {
		var imagem = $("#sessao").css("background-image");
		if(imagem.match("bt3")) {
			$("#sessao").css("background-image", "url(imagem/bt4.png)");
		}
		else {
			$("#sessao").css("background-image", "url(imagem/bt3.png)");
		}
		$("#tree").slideToggle();
	});
	$("#rodape").html("<div id='busca'><input type='text' id='campoPesquisa' placeholder='Pesquisar texto'  /></div><span id='rodape2'></span>");
	$("#campoPesquisa").bind("keyup change", function (ev) {
		var searchTerm = $(this).val();
		$("#conteudo").removeHighlight();
		if(this.value.length >= 3) {
			if(searchTerm) {
				$("#conteudo").highlight(searchTerm);
			}
		}
	});
	$("#conteudo").jfontsize({
		btnMinusClasseId: "#jfontsize-m",
		btnDefaultClasseId: "#jfontsize-d",
		btnPlusClasseId: "#jfontsize-p"
	});
	$(document).keydown(function (e) {
		if(e.keyCode == 37) {
			$("#voltar").trigger("click");
			return false;
		}
		if(e.keyCode == 39) {
			ativo = $("#avancar").html();
			if(ativo) {
				$("#avancar").trigger("click");
			}
			else {
				$("#avancarInativo").trigger("click");
			}
			return false;
		}
	});
	$(document.body).on("click", "li.item a", function () {
		$("#tree").slideToggle();
	});
	$(document.body).on("click", "li.titulo", function () {
		var ul = $(this).closest("ul.menu");
		var id = "#" + ul.attr("id");
		if($(this).data('state') == 'opened') {
			$(this).css("background-image", "url(imagem/icones/toggle_plus.png)");
			$(id + " li.item").hide("normal");
			$(this).data('state', 'closed');
		}
		else {
			$(this).css("background-image", "url(imagem/icones/toggle_minus.png)");
			$(id + " li.item").show("normal");
			$(this).data('state', 'opened');
		}
	});
	update_indicator = function () {
		$("#sessao").html(Manager.Core.Data.Session.current_page.titulo);
		$(".item .icon" + Manager.Core.Data.Session.current_page.id).attr('src', 'imagem/li_1.png');
		porcentagem = Math.round(Manager.Core.Data.suspend_data.pages.visited.length / Manager.Core.Data.Session.Navigation.total_items * 100);
		$("#porcento").css("background-position", "-" + (100 - porcentagem) + "px 0px");
		var displayporc = porcentagem + "%";
		var display = "<strong>Total do Curso:</strong>";
		Manager.Core.Data.suspend_data.pages.progress = porcentagem;
		if(porcentagem >= 100) {
			if(test !== true) {
				Manager.Core.Navigation.set_lesson_status();
			}
		}
		$("#quantidade").html(display);
		$("#porcento").html(displayporc);
	}
	Manager.Core.Workflow.attach('page_loaded_ok', update_indicator);
});