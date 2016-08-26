//CONTROLADOR JURIDICA
Number.prototype.padLeft = function(base,chr){
   var  len = (String(base || 10).length - String(this).length)+1;
   return len > 0? new Array(len).join(chr || '0')+this : this;
}
var _peRfiles;
var _inD;
var _inDPorperfil;
var fatcaParam;
var tClasEmpresaFatca;
var controller = new controller();

function controller(){
	cargaInicial();

	// animaciónes colapso de subtitulos
	jq('.sub_collap_pep, .sub_collap_rel').hide();
    jq('.sub_collap').click(function(){
		jq(this).nextUntil('tr.sub_collap').fadeToggle();
	});





	//validaciones

	//valida rut vacio
	function on_empty (E){
		E.removeClass( "validation" );
		if(E.attr('id')=='ident_cliente'){

		}else if (E.attr('id')=='ident_rep_legal'){
			ident_rep_legalChange();
		}else if (E.attr('id')=='identificador_apode'){
			identificador_apodeChange();
		}else {
			var parent = E.parent().parent();
			for (i = 1; i < 11; i++) {
				if(E.hasClass('participa'+i)){
					E.removeClass('required');
					var participax = parent.find('.participa'+i+':not(.rut)');
					participax.attr('disabled','disabled');
					participax.not('.pais').val('');
					participax.removeAttr('checked');
					participax.removeClass('required');
					participax.removeClass('validation');
					if(!E.hasClass('REL')){
						parent.nextUntil('tr.sub_collap_inter').hide();
					}
				}
			}
		}
	};

	//valida rut con error
	function on_error (E){
		E.addClass( "validation" );
		if(E.attr('id')=='ident_cliente'){

		}else if (E.attr('id')=='ident_rep_legal'){
			ident_rep_legalChange();
		}else if (E.attr('id')=='identificador_apode'){
			identificador_apodeChange();
		}else {
			var parent = E.parent().parent();
			for (i = 1; i < 11; i++) {
				if(E.hasClass('participa'+i)){
					E.addClass('required');
					var participax = parent.find('.participa'+i+':not(.rut)');
					participax.attr('disabled','disabled');
					participax.not('.pais').val('');
					participax.removeAttr('checked');
					participax.addClass('required');
					if(!E.hasClass('REL')){
						parent.nextUntil('tr.sub_collap_inter').hide();
					}
				}
			}
		}
	};

	//valida rut correcto
	function on_success (E){ 
		E.removeClass( "validation" );
		if(E.hasClass('no-permite-duplicado')){
			if(evaluaRepetidos(E)){
				alert('Este campo no permite duplicidad de rut');
			}
		}
		if(E.attr('id')=='ident_cliente'){
			if(E.val()==jq('#ident_rep_legal').val()||E.val()==jq('#identificador_apode').val()){
				alert('Este campo no permite duplicidad de rut');
				E.val('');
			}else{
				validaExistePersona(E);
			}
		}else if (E.attr('id')=='ident_rep_legal'){
			ident_rep_legalChange();
		}else if (E.attr('id')=='identificador_apode'){
			identificador_apodeChange();
		}else {
			var parent = E.parent().parent();
			for (i = 1; i < 11; i++) {
				if(E.hasClass('participa'+i)){
					E.addClass('required');
					var participax = parent.find('.participa'+i+':not(.rut)');
					participax.removeAttr('disabled');
					participax.addClass('required');
					participax.removeClass('validation');

				}
			}
		}
	};

	//valida fecha
	function existeFecha (E) {
		var fecha = E;
        var fechaf = fecha.split("-");
        var d = fechaf[0];
        var m = fechaf[1];
        var y = fechaf[2];
        return m > 0 && m < 13 && y > 1753 && y < 9999 && d > 0 && d <= (new Date(y, m, 0)).getDate();
	}

	//valida correo
	function existeCorreo (E) {
		if((/^\w+([\.\+\-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(E))||(E=='')){
			return true;
		}else{
			return false;
		}
	}

	//valida correo
	function existeUrl (E) {
		if((/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \?=.-]*)*\/?$/.test(E))||(E=='')){
			return true;
		}else{
			return false;
		}
	}

	//valida telefono
	function validaTelefono(E){
		try{
			var array = E.match(/\d+/g);
			if(jq.isNumeric(array[0]) && jq.isNumeric(array[1]) && jq.isNumeric(array[2])){
				return true;
			}else{
				return false;
			}
		}catch(err){
			return false;
		}
	}

	function setRadio (name, value){
		if(value == 'S' || value == 's'){
			jq('input[name='+name+'][value=S]').prop('checked',true);
			jq('input[name='+name+'][value=N]').prop('checked',false);
		}else{
			jq('input[name='+name+'][value=S]').prop('checked',false);
			jq('input[name='+name+'][value=N]').prop('checked',true);
		}
	}

	function setCombo (name, value){
		if(value != ''){
			jq('[name='+name+'] option[value='+value+']').prop('selected', true);
		}else{
			jq('[name='+name+']').prop('selectedIndex',0);
		}
	}

	function setCheckBox (E, value){
		if(value == 'S' || value == 's'){
			E.prop('checked', true);
		}else{
			E.prop('checked', false);
		}
	}

	function evaluaRepetidos(E){
		var confirma = false;
		var notAllowRepeat = jq('.no-permite-duplicado:not(#'+E.attr('id')+')');
		notAllowRepeat.each(function(){
			if(E.val()==jq(this).val() && E.val()!=''){
				E.addClass("validation");
				confirma = true;
			}
		});
		return confirma;
	}

	//valida pais seleccionado y carga regiones y comunas
	function changePais(id_pais, id_region, id_comuna, id_ciudad){
		var pai_id = jq('#'+id_pais+' option:selected').val();
		if(pai_id == 'CL'){
			if(id_region != ''){
				if(!jq('#'+id_region).hasClass('required')){
					jq('#'+id_region).removeAttr('disabled');
					jq('#'+id_region).prop('selectedIndex', 0);
					if(id_region != 'region_contacto'){
						jq('#'+id_region).addClass('required');
						jq('#'+id_region).parent().prepend('<span class="req" style="color:red">* </span>');
					}
					jq('#'+id_region).removeClass('validation');
				}
			}
			jq('#'+id_comuna).html('');
		    jq('#'+id_comuna).append('<option value="0">Seleccione...</option>');
		    jq('#'+id_comuna).parent().find('.'+id_comuna).text('Comuna:');
		    jq('#'+id_ciudad).val('');

		}else{
			if(id_region != ''){
				jq('#'+id_region).removeClass('required');
				jq('#'+id_region).removeClass('validation');
	       		jq('#'+id_region).attr('disabled','disabled');
				jq('#'+id_region).prop('selectedIndex', 0);
				jq('#'+id_region).parent().find('.req').remove();
			}
			jq('#'+id_comuna).parent().find('.'+id_comuna).text('Estado/Provincia:');
		return jq.ajax({
		       type: 'POST',
		       url: 'enrolrapido.do?ServiceName=getCiudapAiinFo',
		       data: {'pai_id': pai_id},
		       success: function (data){
		    	   	
		       		var js = jq.parseJSON(data);
		       		jq('#'+id_comuna).html('');
		    	  	jq('#'+id_comuna).append('<option value="0">Seleccione...</option>');
		    	  	jq('#'+id_ciudad).val('');
		       		jq.each(js.data ,function(i,item){
		       			jq('#'+id_comuna).append('<option label="'+item.com_ciudad.trim()+'" value="'+item.value.trim()+'">'+item.label.trim()+'</option>');
		       		});
		       },
		       error: function(error) {
		          alert('Error: ' + JSON.stringify(error));
		       }
		    });
		}
	}

	//valida Región seleccionada y carga comunas
	function changeRegion(id_pais, id_region, id_comuna, id_ciudad){
		var pai_id = jq('#'+id_pais+' option:selected').val();
		var reg_id = jq('#'+id_region+' option:selected').val();
		jq('#'+id_ciudad).val('');
		if(jq('#'+id_region+' option:selected').index()>0){
			jq('#'+id_comuna).html('');
		   	jq('#'+id_comuna).append('<option value="0">Seleccione...</option>');
		return jq.ajax({
		       type: 'POST',
		       url: 'enrolrapido.do?ServiceName=getComunaByrRegionInfo',
		       data: {'pai_id': pai_id, 'reg_id': reg_id},
		       success: function (data){
		       		var js = jq.parseJSON(data);
		       		jq('#'+id_comuna).html('');
		    	  	jq('#'+id_comuna).append('<option value="0">Seleccione...</option>');
		       		jq.each(js.data ,function(i,item){
		       			jq('#'+id_comuna).append('<option label="'+item.com_ciudad.trim()+'" value="'+item.data.trim()+'">'+item.label.trim()+'</option>');
		       		});
		       },
		       error: function(error) {
		          alert('Error: ' + JSON.stringify(error));
		       }
		    });
		}else{
			jq('#'+id_comuna).html('');
		   	jq('#'+id_comuna).append('<option value="0">Seleccione...</option>');
		}
	}

	//valida comuna seleccionada
	function changeComuna(id_comuna, id_ciudad){
		var ciudad = jq('#'+id_comuna+' option:selected').attr('label');
		if(jq('#'+id_comuna+' option:selected').index()>0){
			jq('#'+id_ciudad).val(ciudad);
		}else{
			jq('#'+id_ciudad).val('');
		}
	}

	function setDirecciones(jsonPais, id_Pais, jsonRegion, id_Region, jsonComuna, id_Comuna, id_Ciudad){
		if(jsonPais == '00'|| jsonPais == '0'){jsonPais = '';}
		if(jsonRegion == '00'|| jsonRegion == '0'){jsonRegion = '';}
		if(jsonComuna == '00'|| jsonComuna == '0'){jsonComuna = '';}

		if(jsonPais == 'CL'){
			setCombo(id_Pais,jsonPais);
			jq.when(changePais(id_Pais,id_Region,id_Comuna,id_Ciudad)).then(function() {
				setCombo(id_Region,jsonRegion);
				jq.when(changeRegion(id_Pais, id_Region, id_Comuna, id_Ciudad)).then(function() {
					setCombo(id_Comuna,jsonComuna);
					changeComuna(id_Comuna, id_Ciudad);
				});
			});
		}else{
			setCombo(id_Pais,jsonPais);
			jq.when(changePais(id_Pais,id_Region,id_Comuna,id_Ciudad)).then(function() {
				setCombo(id_Comuna,jsonComuna);
				changeComuna(id_Comuna, id_Ciudad);
			});
		}
	}

	function clasif_emprChange (){
		var codigo_giin = jq('#codigo_giin');
		var FFI = '';
		var value = jq("#clasif_empr option:selected" ).val();
		tClasEmpresaFatca.each(function(item){
			if(item.id.trim() == value){
				FFI = item.valor.trim();
			}
		});
		
		if ((!fatcaParam.usa_clasificacion_ffi_dinamica == 'Si' && value == "CLEFAFFI")
			|| (fatcaParam.usa_clasificacion_ffi_dinamica == 'Si' && FFI == "S")){
			if(!codigo_giin.hasClass('required')){
				codigo_giin.addClass('required');
				codigo_giin.removeAttr('disabled');
				codigo_giin.parent().prepend('<span class="req" style="color:red">* </span>');
			}
		}else{
			codigo_giin.removeClass('required');
			codigo_giin.attr('disabled','disabled');
			codigo_giin.parent().find('.req').remove();
			codigo_giin.val('');
		}
	}

	function dir_extranjeroChange() {
		var dir_extranjero = jq('.dir_extranjero');
		var no_dir_extranjero_complemento = jq('.dir_extranjero:not(#dir_extranjero_complemento)');
		if(jq('#dir_extranjero').is(':checked')){
			if(!no_dir_extranjero_complemento.hasClass('required')){
				dir_extranjero.removeAttr('disabled');
				no_dir_extranjero_complemento.addClass('required');
				no_dir_extranjero_complemento.parent().prepend('<span class="req" style="color:red">* </span>');	
			}
		}else{
			dir_extranjero.attr('disabled','disabled');
			dir_extranjero.removeClass('required');
			dir_extranjero.removeClass('validation');
			dir_extranjero.parent().find('.req').remove();
		}
	}

	function tiene_apoderadoChange() {
		var apoderado = jq('.apoderado');
		if(jq('#tiene_apoderado').is(':checked')){
			if(!apoderado.hasClass('required')){
				apoderado.removeAttr('disabled');
				apoderado.addClass('required');
				apoderado.parent().prepend('<span class="req" style="color:red">* </span>');
			}
		}else{
			apoderado.attr('disabled','disabled');
			apoderado.val('');
			apoderado.removeClass('required');
			apoderado.removeClass('validation');
			apoderado.parent().find('.req').remove();
		}
	}

	function tiene_contactoChange() {
		var contacto = jq('.contacto');
		if(jq('#tiene_contacto').is(':checked')){
			contacto.removeAttr('disabled');
		}else{
			contacto.attr('disabled','disabled');
			contacto.removeClass('validation');
		}
	}

	function tiene_part_en_sociedadesChange() {
		var part_en_sociedades = jq('.part_en_sociedades');
		if(jq('#tiene_part_en_sociedades').is(':checked')){
			if(!part_en_sociedades.hasClass('required')){
				part_en_sociedades.removeAttr('disabled');
				part_en_sociedades.addClass('required');
				part_en_sociedades.parent().prepend('<span class="req" style="color:red">* </span>');
			}
		}else{
			part_en_sociedades.attr('disabled','disabled');
			part_en_sociedades.removeClass('required');
			part_en_sociedades.removeClass('validation');
			part_en_sociedades.parent().find('.req').remove();
		}
	}

	function participa_es_juridicaChange(E){
		var es_pep = E.parent().parent().find('.participa_es_pep, .participa_es_rel_pep');
		var parent = E.parent().parent();
		var rel = parent.nextUntil('tr.sub_collap_inter').find('.REL');
		if(E.is(':checked')){
			es_pep.removeAttr('checked');
			es_pep.attr('disabled','disabled');
			parent.nextUntil('tr.sub_collap_inter').fadeIn();
			parent.nextUntil('tr.sub_collap_inter','.sub_collap_pep').hide();
		}else{
			es_pep.removeAttr('disabled');
			parent.nextUntil('tr.sub_collap_inter','.sub_collap_rel').fadeOut();
			rel.removeClass('required');
		}
	}

	function participa_es_pepChange(E){
		var es_jur = E.parent().parent().find('.participa_es_juridica');
		var parent = E.parent().parent();
		var pep = parent.nextUntil('tr.sub_collap_inter').find('.PEP');
		if(E.is(':checked')){
			es_jur.removeAttr('checked');
			es_jur.attr('disabled','disabled');
			parent.nextUntil('tr.sub_collap_inter').fadeIn();
			parent.nextUntil('tr.sub_collap_inter','.sub_collap_rel').hide();
			pep.removeAttr('disabled');
			pep.addClass('required');
		}else{
			es_jur.removeAttr('disabled');
			parent.nextUntil('tr.sub_collap_inter','.sub_collap_pep').fadeOut();
			pep.attr('disabled','disabled');
			pep.removeClass('required');
		}
	}

	function ori_fon_inverChange(){
		if(jq('#ori_fon_inver option:selected').val()=='PROOROTRA'){
			if(!jq('#ori_fon_inver_otro').hasClass('required')){
				jq('#ori_fon_inver_otro').removeAttr('disabled');
				jq('#ori_fon_inver_otro').addClass('required');
				jq('#ori_fon_inver_otro').parent().prepend('<span class="req" style="color:red">* </span>');
			}
		}else{
			jq('#ori_fon_inver_otro').attr('disabled','disabled');
			jq('#ori_fon_inver_otro').removeClass('required');
			jq('#ori_fon_inver_otro').parent().find('.req').remove();
		}
	}

	function cue_bancaria_tipChange(){
		var cuenta_ban = jq('.cuenta_ban');
		if(jq('#cue_bancaria_tip').prop('selectedIndex')==0){
			cuenta_ban.removeClass('required');
			cuenta_ban.removeClass('validation');
			cuenta_ban.attr('disabled','disabled');
			cuenta_ban.parent().find('.req').remove();
		}else{
			if(!cuenta_ban.hasClass('required')){
				cuenta_ban.addClass('required');
				cuenta_ban.removeClass('validation');
				cuenta_ban.removeAttr('disabled');
				cuenta_ban.parent().prepend('<span class="req" style="color:red">* </span>');
			}
		}
	}

	function ident_rep_legalChange(){
		if(jq('#ident_rep_legal').val()==jq('#ident_cliente').val() && jq('#ident_rep_legal').val() != ""){
			alert('Este campo no permite duplicidad de rut');
			jq('#ident_rep_legal').val('');
		}
		return traePersona(jq('#ident_rep_legal').val()).done(function(data){
			var Json = jq.parseJSON(data);
			var rep_legal = jq('#nombre_rep_legal, #apellido_pat_rep_legal, #apellido_mat_rep_legal, #fech_nacimiento_rep_legal, #nacionalidad_rep_legal');
			if(Json.data.mensaje == "persona"){
				jq('#fech_inicio_relacion_rep_legal').val('');
				jq('#nombre_rep_legal').val(Json.data.per_nombres.trim());
				jq('#apellido_pat_rep_legal').val(Json.data.per_paterno.trim());
				jq('#apellido_mat_rep_legal').val(Json.data.per_materno.trim());
				var d = new Date(Json.data.per_FecNaci.trim());
				jq('#fech_nacimiento_rep_legal').val((d.getDate()+1).padLeft()+'-'+(d.getMonth()+1).padLeft()+'-'+d.getFullYear());
				jq('#nacionalidad_rep_legal option[value='+Json.data.per_pais_iso.trim()+']').prop('selected', true);
				rep_legal.attr('disabled','disabled');
				rep_legal.removeClass('required');
			}else if (Json.data.mensaje == "solpersona"){
				jq('#fech_inicio_relacion_rep_legal').val('');
				jq('#nombre_rep_legal').val(Json.data.per_nombres.trim());
				jq('#apellido_pat_rep_legal').val(Json.data.per_paterno.trim());
				jq('#apellido_mat_rep_legal').val(Json.data.per_materno.trim());
				var d = new Date(Json.data.per_FecNaci.trim());
				jq('#fech_nacimiento_rep_legal').val((d.getDate()+1).padLeft()+'-'+(d.getMonth()+1).padLeft()+'-'+d.getFullYear());
				jq('#nacionalidad_rep_legal option[value='+Json.data.per_pais_iso.trim()+']').prop('selected', true);
				rep_legal.attr('disabled','disabled');
				rep_legal.removeClass('required');
			}else if(Json.data.mensaje == "0"){
				jq('#fech_inicio_relacion_rep_legal').val('');
				jq('#nombre_rep_legal').val('');
				jq('#apellido_pat_rep_legal').val('');
				jq('#apellido_mat_rep_legal').val('');
				jq('#fech_nacimiento_rep_legal').val('');
				jq('#nacionalidad_rep_legal').prop('selectedIndex', 0);
				rep_legal.removeAttr('disabled');
				rep_legal.addClass('required');
			}
		});
		
	}

	function identificador_apodeChange(){
		if(jq('#tiene_apoderado').is(':checked')){
			if(jq('#identificador_apode').val()==jq('#ident_cliente').val() && jq('#identificador_apode').val() != ""){
				alert('Este campo no permite duplicidad de rut');
				jq('#identificador_apode').val('');
			}
			return traePersona(jq('#identificador_apode').val()).done(function(data){
				var Json = jq.parseJSON(data);
				var apoderado = jq('#nombre_apode, #apellido_pat_apode, #apellido_mat_apode, #nacionalidad_rep_legal');
				if(Json.data.mensaje == "persona"){
					jq('#fech_inicio_relacion_apode').val('');
					jq('#nombre_apode').val(Json.data.per_nombres.trim());
					jq('#apellido_pat_apode').val(Json.data.per_paterno.trim());
					jq('#apellido_mat_apode').val(Json.data.per_materno.trim());
					apoderado.attr('disabled','disabled');
					apoderado.removeClass('required');
				}else if (Json.data.mensaje == "solpersona"){
					jq('#fech_inicio_relacion_apode').val('');
					jq('#nombre_apode').val(Json.data.per_nombres.trim());
					jq('#apellido_pat_apode').val(Json.data.per_paterno.trim());
					jq('#apellido_mat_apode').val(Json.data.per_materno.trim());
					apoderado.attr('disabled','disabled');
					apoderado.removeClass('required');
				}else if(Json.data.mensaje == "0"){
					jq('#fech_inicio_relacion_apode').val('');
					jq('#nombre_apode').val('');
					jq('#apellido_pat_apode').val('');
					jq('#apellido_mat_apode').val('');
					apoderado.removeAttr('disabled');
					apoderado.addClass('required');
				}
			});
		}
	}

	function cuenta_ban_origenChange(){
	   	var banco = jq('#cuenta_ban_banco');
	   	var selected_pais = jq('#cuenta_ban_origen option:selected').val();
	 	return	jq.ajax({
			       type: 'POST',
			       url: 'enrolrapido.do?ServiceName=getBancosPorPaisInfo',
			       data: {'ocu_id':selected_pais},
			       success: function (data){
	       				var js = jq.parseJSON(data);
	       				banco.html('');
					  	banco.append('<option value="">Seleccione...</option>');
					  	jq.each(js.data, function(i, item){
							banco.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
					  	});
			       },
			       error: function(error) {
			          alert('Error: ' + JSON.stringify(error));
			       }
			});
	 	
	}

	function correoChange(E){
		if(existeCorreo(E.val())){
			E.removeClass( "validation" );
		}else{
			E.addClass( "validation" );
		}
	}

	function tabla_indChange() {
		var cuenta_comision_uf = jq('#cuenta_comision_uf');
		if(jq('[name=COCUS]').val()=='S'){
			if(!cuenta_comision_uf.hasClass('required')){
				cuenta_comision_uf.addClass('required');
				cuenta_comision_uf.removeAttr('disabled');
				cuenta_comision_uf.parent().prepend('<span class="req" style="color:red">* </span>');
			}
		}else{
			cuenta_comision_uf.removeClass('required');
			cuenta_comision_uf.removeClass('validation');
			cuenta_comision_uf.attr('disabled','disabled');
			cuenta_comision_uf.parent().find('.req').remove();
			cuenta_comision_uf.val('0');
		}
	}














	jq('#clasif_empr').change(function(){clasif_emprChange();});

	jq("#dir_extranjero").change(function(){dir_extranjeroChange();});

	jq("#tiene_apoderado").change(function(){tiene_apoderadoChange();});

	jq("#tiene_contacto").change(function(){tiene_contactoChange();});

	jq("#tiene_part_en_sociedades").change(function(){tiene_part_en_sociedadesChange();});

	jq('.participa_es_juridica').change(function(){participa_es_juridicaChange(jq(this));});
	
	jq('.participa_es_pep').change(function(){participa_es_pepChange(jq(this));});
	
	jq('#ori_fon_inver').change(function(){ori_fon_inverChange();});
	
	jq("#cue_bancaria_tip").change(function(){cue_bancaria_tipChange();});
	
	jq('#cuenta_ban_origen').change(function(){cuenta_ban_origenChange();});

	jq('.correo').on('change',function(){correoChange(jq(this));});
	
	jq("#tabla_ind").on('change','[name=COCUS]',function(){tabla_indChange();});

	//direccion particular
	jq('#dir_pais').change(function(){changePais('dir_pais','dir_region','dir_comuna','dir_ciudad');});
	jq('#dir_region').change(function(){changeRegion('dir_pais','dir_region','dir_comuna','dir_ciudad');});
	jq('#dir_comuna').change(function(){changeComuna('dir_comuna', 'dir_ciudad');});

	//direccion extranjero
	jq('#dir_extran_pais').change(function(){changePais('dir_extran_pais','','dir_extranjero_estado_provincia','dir_extranjero_ciudad');});
	jq('#dir_extranjero_estado_provincia').change(function(){changeComuna('dir_extranjero_estado_provincia', 'dir_extranjero_ciudad');});

	//direccion contacto
	jq('#pais_contacto').change(function(){changePais('pais_contacto','region_contacto','comuna_contacto','ciudad_contacto');});
	jq('#region_contacto').change(function(){changeRegion('pais_contacto','region_contacto','comuna_contacto','ciudad_contacto');});
	jq('#comuna_contacto').change(function(){changeComuna('comuna_contacto', 'ciudad_contacto');});
	




















	//valida formulario
	jq('#_confirmar').click(function(){
		jsShowWindowLoadBlock();
		var inputs = jq('#enrolamiento_juridica :input');
		if(validaCampos(inputs)){
			enviarDatos(inputs, 'normal');
		}else{
			alert("Datos Inválidos en el Formulario. Por favor revise y envíe nuevamente");
			jsRemoveWindowLoadBlock();
		}
	});


	jq('#_borrador').click(function(){
		jsShowWindowLoadBlock();
		var inputs = jq('#enrolamiento_juridica :input');
		if(validaCamposBorrador(inputs)){
			enviarDatos(inputs, 'BOR');
		}else{
			alert("Datos Inválidos en el Formulario. Por favor revise y envíe nuevamente");
			jsRemoveWindowLoadBlock();
		}
	});

















	
	jq('.fecha').mask('00-00-0000', {
		placeholder: "__-__-____",
		clearIfNotMatch: true,
		onComplete: function(cep, arg) {
			if(existeFecha(cep)){
				jq('#' + arg.currentTarget.id).removeClass( "validation" );
			}else{
				jq('#' + arg.currentTarget.id).addClass( "validation" );
			}
		}
	});

	
	jq('.telefono').mask('(099) (099) 000099999999', {
		placeholder: "(__) (__) _______"
	});

	jq('.comision_por').mask('099.09',{
		  onChange: function(cep, arg){
		    if(cep >= 0 && cep <= 100){
				jq('#' + arg.currentTarget.id).removeClass( "validation" );
			}else{
				jq('#' + arg.currentTarget.id).addClass( "validation" );
			}
		  }
	});

	jq('.comision_uf').mask('099.09',{
		  onChange: function(cep, arg){
		    if(cep >= 0 && cep <= 999.99){
				jq('#' + arg.currentTarget.id).removeClass( "validation" );
			}else{
				jq('#' + arg.currentTarget.id).addClass( "validation" );
			}
		  }
	});
	jq('#porcentaje_part_en_sociedades').mask('099.09',{
			  onChange: function(cep, arg){
			    if(cep >= 0 && cep <= 100){
					jq('#' + arg.currentTarget.id).removeClass( "validation" );
				}else{
					jq('#' + arg.currentTarget.id).addClass( "validation" );
				}
			  }
	});
	
	jq('.porcentaje').mask('009.09',{
			  onChange: function(cep, arg){
			    if(cep >= 10 && cep <= 100){
					jq('#' + arg.currentTarget.id).removeClass( "validation" );
				}else{
					jq('#' + arg.currentTarget.id).addClass( "validation" );
				}
			  }
	});

	//agrega (instancia) calendario
	jq('.fecha').each(function() {
		new JsDatePick({
			useMode:2,
			target:this.id,
			dateFormat:"%d-%m-%Y",
			button:this.id+'_button'
		});
	});


	// agrega listener de validacion a todos los input con clase 'rut', extiende sus funciones desde JQuery.Rut
	jq('.rut').Rut({
	  on_empty: on_empty,
	  on_error: on_error,
	  on_success: on_success,
	  format_on: 'change'
	});

	jq('.giro').select2();
	jq('#cuenta_numero').mask('099');
	jq('#telefono_particular').val('(56) (2)');
	jq('#telefono_celular').val('(56) (9)');
	jq('#pagina_web').attr("placeholder", "http://www.ejemplo.cl o www.ejemplo.cl");
	jq('.comision_uf').val('0');
	jq('#cuenta_numero').val('0');












	
	


	function cargaInicial(){
		//carga formulario
		jq.ajax({
		       type: 'POST',
		       url: 'enrolrapido.do?ServiceName=getInforEnrolamiento',
		       data: {'per_tip_per': 'JUR'},
		       success: function (data){
		       				var js = jq.parseJSON(data);

		       				var rel_corr_ncg = jq("#rel_corr_ncg");
				    	  	rel_corr_ncg.html('');
				    	  	rel_corr_ncg.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.relaCorr, function(i, item){
				    			if(item.data.trim() == 'RELCOMIEM' || item.data.trim() == 'RELCONING' ||item.data.trim() == 'RELCOOTRA' ||item.data.trim() == 'RELCOSOC'){
			    		  			rel_corr_ncg.append('<option value="'+item.data.trim()+'">'+item.label.trim()+'</option>');
			    		  		}
				    	  	});
				    	  	jq("#rel_corr_ncg option[value=RELCONING]").prop('selected', true);

			    		  	var cuen_bancar_mon = jq("#cuen_bancar_mon");
				    	  	cuen_bancar_mon.html('');
				    	  	cuen_bancar_mon.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.Monedas, function(i, item){
				    			cuen_bancar_mon.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});

			    		  	var tipo_cli = jq("#tipo_cli");
				    	  	tipo_cli.html('');
				    	  	tipo_cli.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.TipoCliente, function(i, item){
				    			tipo_cli.append('<option value="'+item.data.trim()+'">'+item.label.trim()+'</option>');
				    	  	});
				    	  	jq("#tipo_cli option[value=TCLIINVER]").prop('selected', true);

			    		  	var tipo_ent_legal = jq("#tipo_ent_legal");
				    	  	tipo_ent_legal.html('');
				    	  	tipo_ent_legal.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.TipEntidadLegal, function(i, item){
				    			tipo_ent_legal.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
							tClasEmpresaFatca = js.tClasEmpresaFatca;
			    		  	var clasif_empr = jq("#clasif_empr");
							clasif_empr.html('');
				    	  	clasif_empr.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.tClasEmpresaFatca, function(i, item){
				    			clasif_empr.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});

			    		  	var cuenta_tipo_perfil = jq("#cuenta_tipo_perfil");
							cuenta_tipo_perfil.html('');
				    	  	cuenta_tipo_perfil.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.perfilCome, function(i, item){
				    			cuenta_tipo_perfil.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
							
							var cuenta_prop = jq("#cuenta_prop");
							cuenta_prop.html('');
				    	  	cuenta_prop.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.propositos, function(i, item){
				    			cuenta_prop.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
				    	  	jq("#cuenta_prop option[value=PROPCINTER]").prop('selected', true);
							
							var clas_fatca = jq("#clas_fatca");
							clas_fatca.html('');
			    		  	jq.each(js.ClasFATCA, function(i, item){
				    			clas_fatca.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
			    		  	jq("#clas_fatca option[value=CLAFANONUS]").prop('selected', true);

			    		  	var ori_fon_inver = jq("#ori_fon_inver");
							ori_fon_inver.html('');
				    	  	ori_fon_inver.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.OrigenFondosInvertir, function(i, item){
				    			ori_fon_inver.append('<option value="'+item.data.trim()+'">'+item.label.trim()+'</option>');
				    	  	});

			    		  	var venta_men_aprox = jq("#venta_men_aprox");
				    	  	venta_men_aprox.html('');
				    	  	venta_men_aprox.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.VentasMensuales, function(i, item){
				    			venta_men_aprox.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});

			    		  	var patrimonio_per_jur = jq("#patrimonio_per_jur");
				    	  	patrimonio_per_jur.html('');
				    	  	patrimonio_per_jur.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.PatrimonioSociedad, function(i, item){
				    			patrimonio_per_jur.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});

			    		  	var cue_bancaria_tip = jq("#cue_bancaria_tip");
				    	  	cue_bancaria_tip.html('');
				    	  	cue_bancaria_tip.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.tCtaBancaria, function(i, item){
				    			cue_bancaria_tip.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
				    	  	
				    	  	

			    		  	var mecanismo_abono = jq("#mecanismo_abono");
				    	  	mecanismo_abono.html('');
				    	  	mecanismo_abono.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.MedioPagoAbonoCliente, function(i, item){
				    			mecanismo_abono.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});

			    		  	var pais = jq(".pais");
				    	  	pais.html('');
				    	  	pais.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.paises, function(i, item){
				    			pais.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});

				    	  	jq(".pais:not('#dir_extran_pais') option[value=CL]").prop('selected', true);
				    	  	jq('#dir_extran_pais option[value=CL]').remove();

				    	  	var giro = jq(".giro");
				    	  	giro.html('');
			    		  	jq.each(js.actividadesComerciales, function(i, item){
			    		  		var id;
			    		  		item.id.trim()=="-1"? id = "0": id = item.id.trim()
				    			giro.append('<option value="'+id+'">'+item.value.trim()+'</option>');
				    	  	});
			    		  	
				    	  	var region = jq(".region");
				    	  	region.html('');
				    	  	region.append('<option value="0">Seleccione...</option>');
			    		  	jq.each(js.regiones, function(i, item){
				    			region.append('<option value="'+item.value.trim()+'">'+item.nemo.trim()+'</option>');
				    	  	});

				    	  	var banco = jq(".banco");
				    	  	banco.html('');
				    	  	banco.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.Bancos, function(i, item){
				    			banco.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});

				    	  	var tabla_ind = jq("#tabla_ind");
				    	  	tabla_ind.html('');
				    	  	jq.each(js.indicadores, function(i, item){
				    	  		var htmlindicador;
				    	  		htmlindicador = '<tr><td>'+item.value.trim()+':</td><td><select class="" style="max-width: 90px !important; width: 90px !important; min-width: 90px !important;" id="'+item.id.trim()+'" name="'+item.idRegla.trim()+'">';
				    	  		var indi = JSON.parse(item.detalles);
				    	  		jq.each(indi, function(x, sub_item){
				    	  			htmlindicador = htmlindicador + '<option value="'+sub_item.id.trim()+'">'+sub_item.value.trim()+'</option>';
				    	  		});
				    	  		htmlindicador = htmlindicador + '</select></td></tr>';
				    	  		tabla_ind.append(htmlindicador);
				    	  	});

				    	  	_peRfiles = js.perfilCome;
							_inD = js.indicadores;
							_inDPorperfil = js.indicadoreXperfil;
							
							fatcaParam = js.fatcaParam[0];
		       },
		       error: function(error) {
		          alert('Error: ' + JSON.stringify(error));
		       }
		});

	}

	function enviarDatos (inputs, tipoGuardado){
		try{
			jsonObj = [];
			inputs.each(function() {
				var e = jq(this);
				switch(e.prop('type')) {
						case 'text':
							if(e.hasClass('rut')){
								var per_id = {};
								per_id ["name"] = e.attr('name')+"_per_id";
								per_id ["value"] = jq.Rut.quitarFormato_rut(e.val());
								jsonObj.push(per_id);
								var dv = {};
								dv ["name"] = e.attr('name')+"_dv";
								dv ["value"] = jq.Rut.quitarFormato_dv(e.val());
								jsonObj.push(dv);
								var item = {};
								item ["name"] = e.attr('name');
								item ["value"] = e.val();
								jsonObj.push(item);
							}else if(e.hasClass('telefono')){
								try{
									var arrayfono = e.val().match(/\d+/g);
									var cod_pais = {};
									var cod_area = {};
									var numero = {};
									if(arrayfono == null || typeof arrayfono[0] == 'undefined' || typeof arrayfono[1] == 'undefined' || typeof arrayfono[2] == 'undefined'){
										cod_pais ["name"] = e.attr('name')+"_cod_pais";
										cod_pais ["value"] = '';
										jsonObj.push(cod_pais);

										cod_area ["name"] = e.attr('name')+"_cod_area";
										cod_area ["value"] = '';
										jsonObj.push(cod_area);

										numero ["name"] = e.attr('name')+"_numero";
										numero ["value"] = '';
										jsonObj.push(numero);
									}else{
										cod_pais ["name"] = e.attr('name')+"_cod_pais";
										cod_pais ["value"] = arrayfono[0];
										jsonObj.push(cod_pais);

										cod_area ["name"] = e.attr('name')+"_cod_area";
										cod_area ["value"] = arrayfono[1];
										jsonObj.push(cod_area);

										numero ["name"] = e.attr('name')+"_numero";
										numero ["value"] = arrayfono[2];
										jsonObj.push(numero);
									}
								}catch(err){}
							}else if(e.hasClass('fecha')){
								item = {};
								var fechasplit = e.val().split("-");
								item["name"] = e.attr('name');
								if(fechasplit == null || typeof fechasplit[0] == 'undefined' || typeof fechasplit[1] == 'undefined' || typeof fechasplit[2] == 'undefined'){
									item["value"] = "";
								}else{
									item["value"] = fechasplit[2]+"-"+fechasplit[1]+"-"+fechasplit[0];
								}
								jsonObj.push(item);
							}else{
								var item = {};
								item ["name"] = e.attr('name');
								item ["value"] = e.val();
								jsonObj.push(item);
							}
						break;
						case 'select-one':
							var item = {};
							item ["name"] = e.attr('name');
							item ["value"] = e.val();
							jsonObj.push(item);
						break;
						case 'checkbox':
							var item = {};
							item ["name"] = e.attr('name');
							if(e.is(':checked')){
								item ["value"] = "S";
							}else{
								item ["value"] = "N";
							}
							jsonObj.push(item);
						break;
						case 'radio':
							var item = {};
							if(e.is(':checked')){
								item ["name"] = e.attr('name');
								item ["value"] = e.val();
								jsonObj.push(item);
							}
						break;
				}
			});

			var borrador = {};
			borrador ["name"] = "tipoGuardado";
			borrador ["value"] = tipoGuardado;
			jsonObj.push(borrador);

			var per_tip_per = {};
			per_tip_per ["name"] = "per_tip_per";
			per_tip_per ["value"] = "JUR";
			jsonObj.push(per_tip_per);

			var idIndicador = {};
			idIndicador ["name"] = "idIndicador";
			idIndicador ["value"] = idIndicadorFun();

			jsonObj.push(idIndicador);
			jq.ajax({
			       type: 'POST',
			       url: 'enrolrapido.do?ServiceName=ingresaCliente',
			       data: jsonObj,
			       success: function (data){
			       				var js = jq.parseJSON(data);
			       				if(js.statusCode=="0"){
			       					if(tipoGuardado=='BOR'){
			       						alert("Borrador Creado con Éxito");
			       					}else{
			       						alert("Cliente Creado con Éxito");
			       					}
			       					LimpiaCampos(inputs);
			       				}else{
			       					if(tipoGuardado=='BOR'){
			       						alert("No se pudo Crear el Borrador");
			       					}else{
			       						alert("No se pudo Crear el Cliente");
			       					}
			       				}
			       },
			       error: function(error) {
			          alert('Error: ' + JSON.stringify(error));
			       },
			       complete: function(){
			       	  jsRemoveWindowLoadBlock();
			       }
			});
		}catch(err){
			jsRemoveWindowLoadBlock();
		}
	}



	function validaCampos (inputs){
		var suma_porcentajes = 0;
		var validado = true;
		try{
			inputs.each(function(index,object){
				var e = jq(this);
				if(e.hasClass('required')){
					switch(e.prop('type')) {
						case 'text':
							if(e.hasClass('rut')){
								if(e.val()!='' && jq.Rut.validar(e.val())){
									if(e.hasClass('no-permite-duplicado')){
										if(evaluaRepetidos(e)){
											e.addClass('validation');
											validado = false;
										}else{
											e.removeClass('validation');
										}
									}else{
										e.removeClass('validation');
									}
								}else{
									e.addClass('validation');
									validado = false;
								}
							}else if(e.hasClass('web')){
								if(existeUrl(e.val())){
									e.removeClass('validation');
								}else{
									e.addClass('validation');
									validado = false;
								}
							}else if(e.hasClass('fecha')){
								if(e.val()!='' && existeFecha(e.val())){
									e.removeClass('validation');
								}else{
									e.addClass('validation');
									validado = false;
								}
							}else if(e.hasClass('correo')){
								if(e.val()!='' && existeCorreo(e.val())){
									e.removeClass('validation');
								}else{
									e.addClass('validation');
									validado = false;
								}
							}else if(e.hasClass('porcentaje')){
								if(e.val() >= 10 && e.val() <= 100){
									suma_porcentajes = suma_porcentajes + parseFloat(e.val());
									e.removeClass('validation');
								}else{
									e.addClass('validation');
									validado = false;
								}
							}else if(e.attr('id')=='porcentaje_part_en_sociedades'){
								try{
									if(parseFloat(e.val()) >= 0 && parseFloat(e.val()) <= 100){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}catch(err){
									e.addClass('validation');
									validado = false;
								}
							}else if(e.hasClass('comision_por')){
								try{
									if(parseFloat(e.val()) >= 0 && parseFloat(e.val()) <= 100){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}catch(err){
									e.addClass('validation');
									validado = false;
								}
							}else if(e.hasClass('comision_uf')){
								try{
									if(parseFloat(e.val()) >= 0 && parseFloat(e.val()) <= 999.99){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}catch(err){
									e.addClass('validation');
									validado = false;
								}
							}else if(e.hasClass('telefono')){
								if(e.val()!='' && validaTelefono(e.val())){
									e.removeClass('validation');
								}else{
									e.addClass('validation');
									validado = false;
								}
							}else{
								if(e.val()!=''){
									e.removeClass('validation');
								}else{
									e.addClass('validation');
									validado = false;
								}
							}
							break;
						case 'select-one':
							if(e.hasClass('giro')){
								e.removeClass('validation');
							}else{
								if(e.prop('selectedIndex')==0){
									e.addClass('validation');
									validado = false;
								}else{
									e.removeClass('validation');
								}
							}
							break;
					}
				}else{
					e.removeClass('validation');
				}
			});
			if(suma_porcentajes>100){
				jq('.porcentaje.required').addClass('validation');
				validado = false;
			}
		}catch(err){
			validado = false;
		}
		return validado;
	}



	function validaCamposBorrador (inputs){
		var validado = true;
		try{
			inputs.each(function(index,object){
				var e = jq(this);
				if(e.hasClass('required_2')){
					switch(e.prop('type')) {
						case 'text':
							if(e.hasClass('rut')){
								if(e.hasClass('allowEmpty')){
									if(e.val() == '' || jq.Rut.validar(e.val())){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}else{
									if(e.val() != '' && jq.Rut.validar(e.val())){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}
							}else if(e.hasClass('web')){
								if(existeUrl(e.val())){
									e.removeClass('validation');
								}else{
									e.addClass('validation');
									validado = false;
								}
							}else if(e.hasClass('fecha')){

								if(e.hasClass('allowEmpty')){
									if(e.val()=='' || existeFecha(e.val())){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}else{
									if(e.val()!='' && existeFecha(e.val())){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}
							}else if(e.hasClass('correo')){


								if(e.hasClass('allowEmpty')){
									if(e.val()=='' || existeCorreo(e.val())){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}else{
									if(e.val()!='' && existeCorreo(e.val())){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}
							}else if(e.hasClass('telefono')){
								if(e.hasClass('allowEmpty')){
									if(e.val()=='' || validaTelefono(e.val())){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}else{
									if(e.val()!='' && validaTelefono(e.val())){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}
							}else{
								if(e.hasClass('allowEmpty')){
									if(e.val()==''){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}else{
									if(e.val()!=''){
										e.removeClass('validation');
									}else{
										e.addClass('validation');
										validado = false;
									}
								}
								
							}
							break;
						case 'select-one':
							if(e.hasClass('giro')){
								e.removeClass('validation');
							}else{
								if(e.prop('selectedIndex')==0){
									e.addClass('validation');
									validado = false;
								}else{
									e.removeClass('validation');
								}
							}
							break;
					}
				}else{
					e.removeClass('validation');
				}
			});
		}catch(err){
			validado = false;
		}
		return validado;
	}



	function validaExistePersona (E){
		if(E.val()!=''){
		try{
			var data = {};
			var per_id = jq.Rut.quitarFormato_rut(E.val());
			var dv = jq.Rut.quitarFormato_dv(E.val());
			data["contexto"] = "ENR";
			data["rut"] = per_id;
			data["dv"] = dv;
			data["tipoDoc"] = "RUT";
			jq.ajax({
		       type: 'POST',
		       url: 'enrolrapido.do?ServiceName=existePersonaOSolicitud',
		       data: data,
		       success: function (data){
		       		var js = jq.parseJSON(data);
		       		if(js.statusCode=="0"||js.statusCode=="6"||js.statusCode=="7"){
       					alert("El Rut o Pasaporte Ingresado ya es cliente, no puede generar un enrolamiento");
       					E.val("");
       					return false;
       				}else if (js.statusCode=="2"||js.statusCode=="3"||js.statusCode=="5"){
       					alert("Ya existe una solicitud en proceso para este Rut o Pasaporte, no puede continuar");
       					E.val("");
       					return false;
       				}else if (js.statusCode=="8"||js.statusCode=="9"){
       					traeBorrador(per_id);
       					return true;
       				}else if (js.statusCode=="11"||js.statusCode=="12"){
       					alert("El Rut Ingresado Corresponde a una Persona Natural, para modificar dirijase al formulario correspondiente");
       					E.val("");
       					return false;
       				}else if (js.statusCode=="1"){
       					return true;
       				}else if(js.statusCode=="10"){
       					//error al validar
       					return true;
       				}else{
       					//rut no existe
       					return true;
       				}
		       },
		       error: function(error) {
		          alert('Error: ' + JSON.stringify(error));
		          return false;
		       }
			});
		}catch(err){
			return false;
		}
		}else{return false;}
	}


jq('#cuenta_tipo_perfil').change(function(){
	perfil_id = jq( "#cuenta_tipo_perfil option:selected" ).val();
	var indicadores = jq('#tabla_ind :input');
	indicadores.prop('selectedIndex', 0);
	//setear indicadores por defecto
	jq.each(_inDPorperfil,function(i, item){
		if(item.perfil.trim()==perfil_id){
			indicadores.each(function(){
				if(jq(this).attr('id')==item.id.trim()){
					jq('#'+item.id.trim()+' option[value='+item.valor.trim()+']').prop('selected', true);
				}
			});
		}
	});
	var cuenta_comision_uf = jq('#cuenta_comision_uf');
	if(jq("[name=COCUS]").val()=='S'){
		if(!cuenta_comision_uf.hasClass('required')){
			cuenta_comision_uf.addClass('required');
			cuenta_comision_uf.removeAttr('disabled');
			cuenta_comision_uf.parent().prepend('<span class="req" style="color:red">* </span>');
		}
	}else{
		cuenta_comision_uf.removeClass('required');
		cuenta_comision_uf.removeClass('validation');
		cuenta_comision_uf.attr('disabled','disabled');
		cuenta_comision_uf.parent().find('.req').remove();
		cuenta_comision_uf.val('0');
	}
});




function idIndicadorFun (){
	var idIndicador = '';
	var indicadores = jq('#tabla_ind :input');
	indicadores.each(function(){
		idIndicador = idIndicador + ':'+ jq(this).attr('id') + '-' + jq(this).val();
	});
	return idIndicador.substring(1, idIndicador.length);
}


function LimpiaCampos(inputs){
	inputs.each(function() {
			var e = jq(this);
			e.removeClass('validation');
			switch(e.prop('type')) {
					case 'text':
						e.val('');
					break;
					case 'select-one':
						e.prop('selectedIndex', 0);
					break;
					case 'checkbox':
						e.prop( "checked", false );
					break;
			}
		});
	jq("input[type='radio'] [value='N']").prop('checked',true);
	jq("#rel_corr_ncg option[value=RELCONING]").prop('selected', true);
	jq("#tipo_cli option[value=TCLIINVER]").prop('selected', true);
	jq("#cuenta_prop option[value=PROPCINTER]").prop('selected', true);
	jq("#clas_fatca option[value=CLAFANONUS]").prop('selected', true);
	jq("#cue_bancaria_tip option[value=TCUENCORRE]").prop('selected', true);
	jq(".pais:not('#dir_extran_pais') option[value=CL]").prop('selected', true);

	jq('#telefono_particular').val('(56) (2)');
	jq('#telefono_celular').val('(56) (9)');
	jq('#pagina_web').val('');
	jq('#pagina_web').attr("placeholder", "http://www.ejemplo.cl o www.ejemplo.cl");
	jq('.comision_uf').val('0');
	jq('#cuenta_numero').val('0');
	jq('.opera_internacional').attr('disabled','disabled');
	jq('#ori_fon_inver_otro').attr('disabled','disabled');
	jq('#ori_fon_inver_otro').removeClass('required');
	jq('#ori_fon_inver_otro').parent().find('.req').remove();
	
	jq('.participan_y_pep :input').removeClass('required');
	jq('.participan_y_pep :input:not(.rut)').attr('disabled','disabled');
	jq('.participan_y_pep :input:not(.pais)').val('');
	jq('.participan_y_pep :input .pais option[value=CL]').prop('selected', true);
	jq('.sub_collap_pep, .sub_collap_rel').hide();
	jq('.giro').select2().val("0").trigger("change");
			var codigo_giin = jq('#codigo_giin');
			codigo_giin.removeClass('required');
			codigo_giin.attr('disabled','disabled');
			codigo_giin.parent().find('.req').remove();
		var dir_extranjero = jq('.dir_extranjero');
			dir_extranjero.attr('disabled','disabled');
			dir_extranjero.removeClass('required');
			dir_extranjero.removeClass('validation');
			dir_extranjero.parent().find('.req').remove();
		var apoderado = jq('.apoderado');
			apoderado.attr('disabled','disabled');
			apoderado.val('');
			apoderado.removeClass('required');
			apoderado.removeClass('validation');
			apoderado.parent().find('.req').remove();
		var contacto = jq('.contacto');
			contacto.attr('disabled','disabled');
			contacto.removeClass('validation');
		var part_en_sociedades = jq('.part_en_sociedades');
			part_en_sociedades.attr('disabled','disabled');
			part_en_sociedades.removeClass('required');
			part_en_sociedades.removeClass('validation');
			part_en_sociedades.parent().find('.req').remove();
			jq('#ori_fon_inver_otro').attr('disabled','disabled');
			jq('#ori_fon_inver_otro').removeClass('required');
			jq('#ori_fon_inver_otro').parent().find('.req').remove();
		var cuenta_ban = jq('.cuenta_ban');
			cuenta_ban.removeClass('required');
			cuenta_ban.removeClass('validation');
			cuenta_ban.attr('disabled','disabled');
			cuenta_ban.parent().find('.req').remove();
}



function traePersona(rut){
	var data = {};
	var per_dv = jq.Rut.quitarFormato_rut(rut)+"-"+jq.Rut.quitarFormato_dv(rut);
	data ["per_rut"] = per_dv;
	return jq.ajax({
       type: 'POST',
       url: 'enrolrapido.do?ServiceName=getPersonaPoRruTinfo',
       data: data,
       success: function (data){
       },
       error: function(error) {
          alert('Error: ' + JSON.stringify(error));
       }
	});
}






function traeBorrador(rut){
	var data = {};
	var per_id = rut;
	data ["per_id"] = rut;
	jq.ajax({
       type: 'POST',
       url: 'enrolrapido.do?ServiceName=getInforBorrador',//NOMBRE DEL SERVICIO
       data: data,
       success: function (data){
       		var JSONtemp = jq.parseJSON(data);
       		var JSON1 = JSONtemp.data;
       		
			
			jq('#fech_nacimiento').val(JSON1.fech_nacimiento.trim());
			setCombo('tipo_cli',JSON1.tipo_cli.trim());
			jq('#identificacion_tributaria').val(JSON1.identificacion_tributaria.trim());
			setCombo('pais_pago_impuestos',JSON1.pais_pago_impuestos.trim());
			//ZELECT
			setCombo('actividad_economica',JSON1.actividad_economica);
			jq('#actividad_economica').select2().val(JSON1.actividad_economica).trigger("change");

			jq('#personeria_juridica').val(JSON1.personeria_juridica.trim());
			jq('#telefono_particular').val(JSON1.telefono_particular.trim());

			jq('#telefono_celular').val(JSON1.telefono_celular.trim());

			jq('#correo_electronico').val(JSON1.correo_electronico.trim());


			setDirecciones(JSON1.dir_pais, 'dir_pais', JSON1.dir_region, 'dir_region', JSON1.dir_comuna, 'dir_comuna', 'dir_ciudad');

			jq('#dir_direccion').val(JSON1.dir_direccion.trim());
			jq('#dir_numero').val(JSON1.dir_numero.trim());
			jq('#dir_complemento').val(JSON1.dir_complemento.trim());
			setCheckBox(jq('#dir_extranjero'),JSON1.dir_extranjero.trim());
			dir_extranjeroChange();

			setDirecciones(JSON1.dir_extran_pais, 'dir_extran_pais', '', '', JSON1.dir_extranjero_estado_provincia, 'dir_extranjero_estado_provincia', 'dir_extranjero_ciudad');


			jq('#dir_extranjero_direccion').val(JSON1.dir_extranjero_direccion.trim());
			jq('#dir_extranjero_numero').val(JSON1.dir_extranjero_numero.trim());
			jq('#dir_extranjero_complemento').val(JSON1.dir_extranjero_complemento.trim());
			setCheckBox(jq('#tiene_contacto'),JSON1.tiene_contacto.trim());
			tiene_contactoChange();
			jq('#nombres_contacto').val(JSON1.nombres_contacto.trim());
			jq('#ape_pat_contacto').val(JSON1.ape_pat_contacto.trim());
			jq('#ape_mat_contacto').val(JSON1.ape_mat_contacto.trim());

			setDirecciones(JSON1.pais_contacto, 'pais_contacto', JSON1.region_contacto, 'region_contacto', JSON1.comuna_contacto, 'comuna_contacto', 'ciudad_contacto');

			jq('#codigo_postal_contacto').val(JSON1.codigo_postal_contacto.trim());
			jq('#direccion_contacto').val(JSON1.direccion_contacto.trim());

			jq('#telefono_par_contacto').val(JSON1.telefono_par_contacto.trim());

			jq('#telefono_cel_contacto').val(JSON1.telefono_cel_contacto.trim());

			jq('#telefono_fax_contacto').val(JSON1.telefono_fax_contacto.trim());
			jq('#correo_electronico_contacto').val(JSON1.correo_electronico_contacto.trim());



			

			

			

			
			setRadio('cuenta_bci',JSON1.cuenta_bci.trim());
			setCombo('rel_corr_ncg',JSON1.rel_corr_ncg.trim());
			setRadio('rel_corr_100',JSON1.rel_corr_100.trim());
			setCombo('clas_fatca',JSON1.clas_fatca.trim());
			setCombo('ori_fon_inver',JSON1.ori_fon_inver.trim());
			ori_fon_inverChange();
			jq('#ori_fon_inver_otro').val(JSON1.ori_fon_inver_otro.trim());
			setCombo('pais_origen_fondos',JSON1.pais_origen_fondos.trim());
			setCombo('mecanismo_abono',JSON1.mecanismo_abono.trim());
			setCombo('cue_bancaria_tip',JSON1.cue_bancaria_tip.trim());
			cue_bancaria_tipChange();
			setCombo('cuenta_ban_origen',JSON1.cuenta_ban_origen.trim());
			jq('#cuenta_ban_sucursal').val(JSON1.cuenta_ban_sucursal.trim());
			jq('#cuenta_ban_numero').val(JSON1.cuenta_ban_numero.trim());
			cuenta_ban_origenChange().done(function(){
				setCombo('cuenta_ban_banco',JSON1.cuenta_ban_banco.trim());
			});
			setCombo('cuen_bancar_mon',JSON1.cuen_bancar_mon.trim());

	//JURIDICA


			jq('#razon_social').val(JSON1.razon_social.trim());
			jq('#nombre_fantasia').val(JSON1.nombre_fantasia.trim());
			jq('#fech_constitucion').val(JSON1.fech_constitucion.trim());
			jq('#fech_escritura_publica').val(JSON1.fech_escritura_publica.trim());
			setCombo('tipo_ent_legal',JSON1.tipo_ent_legal.trim());
			jq('#notaria').val(JSON1.notaria.trim());
			setCombo('pais_constitucion',JSON1.pais_constitucion.trim());
			setCombo('nacionalidad',JSON1.nacionalidad.trim());
			setCombo('pais_casa_matriz',JSON1.pais_casa_matriz.trim());
			setCombo('clasif_empr',JSON1.clasif_empr.trim());

			clasif_emprChange();

			jq('#codigo_giin').val(JSON1.codigo_giin.trim());
			jq('#pagina_web').val(JSON1.pagina_web.trim());
			setCheckBox(jq('#tiene_part_en_sociedades'),JSON1.tiene_part_en_sociedades.trim());
			tiene_part_en_sociedadesChange();

			jq('#rut_part_en_sociedades').val(JSON1.rut_part_en_sociedades.trim());
			jq('#razon_social_part_en_sociedades').val(JSON1.razon_social_part_en_sociedades.trim());
			jq('#porcentaje_part_en_sociedades').val(JSON1.porcentaje_part_en_sociedades);

			//ZELECT
			setCombo('act_economica_part_en_sociedades',JSON1.act_economica_part_en_sociedades);
			jq('#act_economica_part_en_sociedades').select2().val(JSON1.act_economica_part_en_sociedades).trigger("change");

			
			



			//
			
			if(JSON1.participa_rut_1.trim()!='' && jq.Rut.validar(JSON1.participa_rut_1.trim())){
				jq('#participa_rut_1').val(JSON1.participa_rut_1.trim());
				on_success(jq('#participa_rut_1'));
				jq('#participa_razon_1').val(JSON1.participa_razon_1.trim());
				jq('#participa_porcentaje_1').val(JSON1.participa_porcentaje_1);
				setCombo('participa_pais_1',JSON1.participa_pais_1.trim());

				setCheckBox(jq('#participa_es_juridica_1'),JSON1.participa_es_juridica_1.trim());
				setCheckBox(jq('#participa_es_pep_1'),JSON1.participa_es_pep_1.trim());
				if(JSON1.participa_es_juridica_1.trim()=='S'){
					participa_es_juridicaChange(jq('#participa_es_juridica_1'));
				}
				if(JSON1.participa_es_pep_1.trim()=='S'){
					participa_es_pepChange(jq('#participa_es_pep_1'));
				}
				setCheckBox(jq('#participa_es_rel_pep_1'),JSON1.participa_es_rel_pep_1.trim());

				jq('#pep_cargo_1').val(JSON1.pep_cargo_1.trim());
				jq('#pep_institucion_1').val(JSON1.pep_institucion_1.trim());
				jq('#pep_fecha_1').val(JSON1.pep_fecha_1.trim());

				if(JSON1.rel_rut_1_1.trim()!='' && jq.Rut.validar(JSON1.rel_rut_1_1.trim())){
					on_success(jq('#rel_rut_1_1'));
					jq('#rel_nombre_1_1').val(JSON1.rel_nombre_1_1.trim());
					jq('#rel_rut_1_1').val(JSON1.rel_rut_1_1.trim());
					setCombo('rel_pais_1_1',JSON1.rel_pais_1_1.trim());
				}

				if(JSON1.rel_rut_1_2.trim()!='' && jq.Rut.validar(JSON1.rel_rut_1_2.trim())){
					on_success(jq('#rel_rut_1_2'));
					jq('#rel_nombre_1_2').val(JSON1.rel_nombre_1_2.trim());
					jq('#rel_rut_1_2').val(JSON1.rel_rut_1_2.trim());
					setCombo('rel_pais_1_2',JSON1.rel_pais_1_2.trim());
				}

				if(JSON1.rel_rut_1_3.trim()!='' && jq.Rut.validar(JSON1.rel_rut_1_3.trim())){
					on_success(jq('#rel_rut_1_3'));
					jq('#rel_nombre_1_3').val(JSON1.rel_nombre_1_3.trim());
					jq('#rel_rut_1_3').val(JSON1.rel_rut_1_3.trim());
					setCombo('rel_pais_1_3',JSON1.rel_pais_1_3.trim());
				}
				
			}
			//
			//
			if(JSON1.participa_rut_2.trim()!='' && jq.Rut.validar(JSON1.participa_rut_2.trim())){
				jq('#participa_rut_2').val(JSON1.participa_rut_2.trim());
				on_success(jq('#participa_rut_2'));
				jq('#participa_razon_2').val(JSON1.participa_razon_2.trim());
				jq('#participa_porcentaje_2').val(JSON1.participa_porcentaje_2);
				setCombo('participa_pais_2',JSON1.participa_pais_2.trim());

				setCheckBox(jq('#participa_es_juridica_2'),JSON1.participa_es_juridica_2.trim());
				setCheckBox(jq('#participa_es_pep_2'),JSON1.participa_es_pep_2.trim());
				if(JSON1.participa_es_juridica_2.trim()=='S'){
					participa_es_juridicaChange(jq('#participa_es_juridica_2'));
				}
				if(JSON1.participa_es_pep_2.trim()=='S'){
					participa_es_pepChange(jq('#participa_es_pep_2'));
				}
				setCheckBox(jq('#participa_es_rel_pep_2'),JSON1.participa_es_rel_pep_2.trim());

				jq('#pep_cargo_2').val(JSON1.pep_cargo_2.trim());
				jq('#pep_institucion_2').val(JSON1.pep_institucion_2.trim());
				jq('#pep_fecha_2').val(JSON1.pep_fecha_2.trim());

				if(JSON1.rel_rut_2_1.trim()!='' && jq.Rut.validar(JSON1.rel_rut_2_1.trim())){
					on_success(jq('#rel_rut_2_1'));
					jq('#rel_nombre_2_1').val(JSON1.rel_nombre_2_1.trim());
					jq('#rel_rut_2_1').val(JSON1.rel_rut_2_1.trim());
					setCombo('rel_pais_2_1',JSON1.rel_pais_2_1.trim());
				}

				if(JSON1.rel_rut_2_2.trim()!='' && jq.Rut.validar(JSON1.rel_rut_2_2.trim())){
					on_success(jq('#rel_rut_2_2'));
					jq('#rel_nombre_2_2').val(JSON1.rel_nombre_2_2.trim());
					jq('#rel_rut_2_2').val(JSON1.rel_rut_2_2.trim());
					setCombo('rel_pais_2_2',JSON1.rel_pais_2_2.trim());
				}

				if(JSON1.rel_rut_2_3.trim()!='' && jq.Rut.validar(JSON1.rel_rut_2_3.trim())){
					on_success(jq('#rel_rut_2_3'));
					jq('#rel_nombre_2_3').val(JSON1.rel_nombre_2_3.trim());
					jq('#rel_rut_2_3').val(JSON1.rel_rut_2_3.trim());
					setCombo('rel_pais_2_3',JSON1.rel_pais_2_3.trim());
				}
				
			}
			//
			//
			if(JSON1.participa_rut_3.trim()!='' && jq.Rut.validar(JSON1.participa_rut_3.trim())){
				jq('#participa_rut_3').val(JSON1.participa_rut_3.trim());
				on_success(jq('#participa_rut_3'));
				jq('#participa_razon_3').val(JSON1.participa_razon_3.trim());
				jq('#participa_porcentaje_3').val(JSON1.participa_porcentaje_3);
				setCombo('participa_pais_3',JSON1.participa_pais_3.trim());

				setCheckBox(jq('#participa_es_juridica_3'),JSON1.participa_es_juridica_3.trim());
				setCheckBox(jq('#participa_es_pep_3'),JSON1.participa_es_pep_3.trim());
				if(JSON1.participa_es_juridica_3.trim()=='S'){
					participa_es_juridicaChange(jq('#participa_es_juridica_3'));
				}
				if(JSON1.participa_es_pep_3.trim()=='S'){
					participa_es_pepChange(jq('#participa_es_pep_3'));
				}
				setCheckBox(jq('#participa_es_rel_pep_3'),JSON1.participa_es_rel_pep_3.trim());

				jq('#pep_cargo_3').val(JSON1.pep_cargo_3.trim());
				jq('#pep_institucion_3').val(JSON1.pep_institucion_3.trim());
				jq('#pep_fecha_3').val(JSON1.pep_fecha_3.trim());

				if(JSON1.rel_rut_3_1.trim()!='' && jq.Rut.validar(JSON1.rel_rut_3_1.trim())){
					on_success(jq('#rel_rut_3_1'));
					jq('#rel_nombre_3_1').val(JSON1.rel_nombre_3_1.trim());
					jq('#rel_rut_3_1').val(JSON1.rel_rut_3_1.trim());
					setCombo('rel_pais_3_1',JSON1.rel_pais_3_1.trim());
				}

				if(JSON1.rel_rut_3_2.trim()!='' && jq.Rut.validar(JSON1.rel_rut_3_2.trim())){
					on_success(jq('#rel_rut_3_2'));
					jq('#rel_nombre_3_2').val(JSON1.rel_nombre_3_2.trim());
					jq('#rel_rut_3_2').val(JSON1.rel_rut_3_2.trim());
					setCombo('rel_pais_3_2',JSON1.rel_pais_3_2.trim());
				}

				if(JSON1.rel_rut_3_3.trim()!='' && jq.Rut.validar(JSON1.rel_rut_3_3.trim())){
					on_success(jq('#rel_rut_3_3'));
					jq('#rel_nombre_3_3').val(JSON1.rel_nombre_3_3.trim());
					jq('#rel_rut_3_3').val(JSON1.rel_rut_3_3.trim());
					setCombo('rel_pais_3_3',JSON1.rel_pais_3_3.trim());
				}
				
			}
			//
			//
			if(JSON1.participa_rut_4.trim()!='' && jq.Rut.validar(JSON1.participa_rut_4.trim())){
				jq('#participa_rut_4').val(JSON1.participa_rut_4.trim());
				on_success(jq('#participa_rut_4'));
				jq('#participa_razon_4').val(JSON1.participa_razon_4.trim());
				jq('#participa_porcentaje_4').val(JSON1.participa_porcentaje_4);
				setCombo('participa_pais_4',JSON1.participa_pais_4.trim());

				setCheckBox(jq('#participa_es_juridica_4'),JSON1.participa_es_juridica_4.trim());
				setCheckBox(jq('#participa_es_pep_4'),JSON1.participa_es_pep_4.trim());
				if(JSON1.participa_es_juridica_4.trim()=='S'){
					participa_es_juridicaChange(jq('#participa_es_juridica_4'));
				}
				if(JSON1.participa_es_pep_4.trim()=='S'){
					participa_es_pepChange(jq('#participa_es_pep_4'));
				}
				setCheckBox(jq('#participa_es_rel_pep_4'),JSON1.participa_es_rel_pep_4.trim());

				jq('#pep_cargo_4').val(JSON1.pep_cargo_4.trim());
				jq('#pep_institucion_4').val(JSON1.pep_institucion_4.trim());
				jq('#pep_fecha_4').val(JSON1.pep_fecha_4.trim());

				if(JSON1.rel_rut_4_1.trim()!='' && jq.Rut.validar(JSON1.rel_rut_4_1.trim())){
					on_success(jq('#rel_rut_4_1'));
					jq('#rel_nombre_4_1').val(JSON1.rel_nombre_4_1.trim());
					jq('#rel_rut_4_1').val(JSON1.rel_rut_4_1.trim());
					setCombo('rel_pais_4_1',JSON1.rel_pais_4_1.trim());
				}

				if(JSON1.rel_rut_4_2.trim()!='' && jq.Rut.validar(JSON1.rel_rut_4_2.trim())){
					on_success(jq('#rel_rut_4_2'));
					jq('#rel_nombre_4_2').val(JSON1.rel_nombre_4_2.trim());
					jq('#rel_rut_4_2').val(JSON1.rel_rut_4_2.trim());
					setCombo('rel_pais_4_2',JSON1.rel_pais_4_2.trim());
				}

				if(JSON1.rel_rut_4_3.trim()!='' && jq.Rut.validar(JSON1.rel_rut_4_3.trim())){
					on_success(jq('#rel_rut_4_3'));
					jq('#rel_nombre_4_3').val(JSON1.rel_nombre_4_3.trim());
					jq('#rel_rut_4_3').val(JSON1.rel_rut_4_3.trim());
					setCombo('rel_pais_4_3',JSON1.rel_pais_4_3.trim());
				}
				
			}
			//
			//
			if(JSON1.participa_rut_5.trim()!='' && jq.Rut.validar(JSON1.participa_rut_5.trim())){
				jq('#participa_rut_5').val(JSON1.participa_rut_5.trim());
				on_success(jq('#participa_rut_5'));
				jq('#participa_razon_5').val(JSON1.participa_razon_5.trim());
				jq('#participa_porcentaje_5').val(JSON1.participa_porcentaje_5);
				setCombo('participa_pais_5',JSON1.participa_pais_5.trim());

				setCheckBox(jq('#participa_es_juridica_5'),JSON1.participa_es_juridica_5.trim());
				setCheckBox(jq('#participa_es_pep_5'),JSON1.participa_es_pep_5.trim());
				if(JSON1.participa_es_juridica_5.trim()=='S'){
					participa_es_juridicaChange(jq('#participa_es_juridica_5'));
				}
				if(JSON1.participa_es_pep_5.trim()=='S'){
					participa_es_pepChange(jq('#participa_es_pep_5'));
				}
				setCheckBox(jq('#participa_es_rel_pep_5'),JSON1.participa_es_rel_pep_5.trim());

				jq('#pep_cargo_5').val(JSON1.pep_cargo_5.trim());
				jq('#pep_institucion_5').val(JSON1.pep_institucion_5.trim());
				jq('#pep_fecha_5').val(JSON1.pep_fecha_5.trim());

				if(JSON1.rel_rut_5_1.trim()!='' && jq.Rut.validar(JSON1.rel_rut_5_1.trim())){
					on_success(jq('#rel_rut_5_1'));
					jq('#rel_nombre_5_1').val(JSON1.rel_nombre_5_1.trim());
					jq('#rel_rut_5_1').val(JSON1.rel_rut_5_1.trim());
					setCombo('rel_pais_5_1',JSON1.rel_pais_5_1.trim());
				}

				if(JSON1.rel_rut_5_2.trim()!='' && jq.Rut.validar(JSON1.rel_rut_5_2.trim())){
					on_success(jq('#rel_rut_5_2'));
					jq('#rel_nombre_5_2').val(JSON1.rel_nombre_5_2.trim());
					jq('#rel_rut_5_2').val(JSON1.rel_rut_5_2.trim());
					setCombo('rel_pais_5_2',JSON1.rel_pais_5_2.trim());
				}

				if(JSON1.rel_rut_5_3.trim()!='' && jq.Rut.validar(JSON1.rel_rut_5_3.trim())){
					on_success(jq('#rel_rut_5_3'));
					jq('#rel_nombre_5_3').val(JSON1.rel_nombre_5_3.trim());
					jq('#rel_rut_5_3').val(JSON1.rel_rut_5_3.trim());
					setCombo('rel_pais_5_3',JSON1.rel_pais_5_3.trim());
				}
				
			}
			//
			//
			if(JSON1.participa_rut_6.trim()!='' && jq.Rut.validar(JSON1.participa_rut_6.trim())){
				jq('#participa_rut_6').val(JSON1.participa_rut_6.trim());
				on_success(jq('#participa_rut_6'));
				jq('#participa_razon_6').val(JSON1.participa_razon_6.trim());
				jq('#participa_porcentaje_6').val(JSON1.participa_porcentaje_6);
				setCombo('participa_pais_6',JSON1.participa_pais_6.trim());

				setCheckBox(jq('#participa_es_juridica_6'),JSON1.participa_es_juridica_6.trim());
				setCheckBox(jq('#participa_es_pep_6'),JSON1.participa_es_pep_6.trim());
				if(JSON1.participa_es_juridica_6.trim()=='S'){
					participa_es_juridicaChange(jq('#participa_es_juridica_6'));
				}
				if(JSON1.participa_es_pep_6.trim()=='S'){
					participa_es_pepChange(jq('#participa_es_pep_6'));
				}
				setCheckBox(jq('#participa_es_rel_pep_6'),JSON1.participa_es_rel_pep_6.trim());

				jq('#pep_cargo_6').val(JSON1.pep_cargo_6.trim());
				jq('#pep_institucion_6').val(JSON1.pep_institucion_6.trim());
				jq('#pep_fecha_6').val(JSON1.pep_fecha_6.trim());

				if(JSON1.rel_rut_6_1.trim()!='' && jq.Rut.validar(JSON1.rel_rut_6_1.trim())){
					on_success(jq('#rel_rut_6_1'));
					jq('#rel_nombre_6_1').val(JSON1.rel_nombre_6_1.trim());
					jq('#rel_rut_6_1').val(JSON1.rel_rut_6_1.trim());
					setCombo('rel_pais_6_1',JSON1.rel_pais_6_1.trim());
				}

				if(JSON1.rel_rut_6_2.trim()!='' && jq.Rut.validar(JSON1.rel_rut_6_2.trim())){
					on_success(jq('#rel_rut_6_2'));
					jq('#rel_nombre_6_2').val(JSON1.rel_nombre_6_2.trim());
					jq('#rel_rut_6_2').val(JSON1.rel_rut_6_2.trim());
					setCombo('rel_pais_6_2',JSON1.rel_pais_6_2.trim());
				}

				if(JSON1.rel_rut_6_3.trim()!='' && jq.Rut.validar(JSON1.rel_rut_6_3.trim())){
					on_success(jq('#rel_rut_6_3'));
					jq('#rel_nombre_6_3').val(JSON1.rel_nombre_6_3.trim());
					jq('#rel_rut_6_3').val(JSON1.rel_rut_6_3.trim());
					setCombo('rel_pais_6_3',JSON1.rel_pais_6_3.trim());
				}
				
			}
			//
			//
			if(JSON1.participa_rut_7.trim()!='' && jq.Rut.validar(JSON1.participa_rut_7.trim())){
				jq('#participa_rut_7').val(JSON1.participa_rut_7.trim());
				on_success(jq('#participa_rut_7'));
				jq('#participa_razon_7').val(JSON1.participa_razon_7.trim());
				jq('#participa_porcentaje_7').val(JSON1.participa_porcentaje_7);
				setCombo('participa_pais_7',JSON1.participa_pais_7.trim());

				setCheckBox(jq('#participa_es_juridica_7'),JSON1.participa_es_juridica_7.trim());
				setCheckBox(jq('#participa_es_pep_7'),JSON1.participa_es_pep_7.trim());
				if(JSON1.participa_es_juridica_7.trim()=='S'){
					participa_es_juridicaChange(jq('#participa_es_juridica_7'));
				}
				if(JSON1.participa_es_pep_7.trim()=='S'){
					participa_es_pepChange(jq('#participa_es_pep_7'));
				}
				setCheckBox(jq('#participa_es_rel_pep_7'),JSON1.participa_es_rel_pep_7.trim());

				jq('#pep_cargo_7').val(JSON1.pep_cargo_7.trim());
				jq('#pep_institucion_7').val(JSON1.pep_institucion_7.trim());
				jq('#pep_fecha_7').val(JSON1.pep_fecha_7.trim());

				if(JSON1.rel_rut_7_1.trim()!='' && jq.Rut.validar(JSON1.rel_rut_7_1.trim())){
					on_success(jq('#rel_rut_7_1'));
					jq('#rel_nombre_7_1').val(JSON1.rel_nombre_7_1.trim());
					jq('#rel_rut_7_1').val(JSON1.rel_rut_7_1.trim());
					setCombo('rel_pais_7_1',JSON1.rel_pais_7_1.trim());
				}

				if(JSON1.rel_rut_7_2.trim()!='' && jq.Rut.validar(JSON1.rel_rut_7_2.trim())){
					on_success(jq('#rel_rut_7_2'));
					jq('#rel_nombre_7_2').val(JSON1.rel_nombre_7_2.trim());
					jq('#rel_rut_7_2').val(JSON1.rel_rut_7_2.trim());
					setCombo('rel_pais_7_2',JSON1.rel_pais_7_2.trim());
				}

				if(JSON1.rel_rut_7_3.trim()!='' && jq.Rut.validar(JSON1.rel_rut_7_3.trim())){
					on_success(jq('#rel_rut_7_3'));
					jq('#rel_nombre_7_3').val(JSON1.rel_nombre_7_3.trim());
					jq('#rel_rut_7_3').val(JSON1.rel_rut_7_3.trim());
					setCombo('rel_pais_7_3',JSON1.rel_pais_7_3.trim());
				}
				
			}
			//
			//
			if(JSON1.participa_rut_8.trim()!='' && jq.Rut.validar(JSON1.participa_rut_8.trim())){
				jq('#participa_rut_8').val(JSON1.participa_rut_8.trim());
				on_success(jq('#participa_rut_8'));
				jq('#participa_razon_8').val(JSON1.participa_razon_8.trim());
				jq('#participa_porcentaje_8').val(JSON1.participa_porcentaje_8);
				setCombo('participa_pais_8',JSON1.participa_pais_8.trim());

				setCheckBox(jq('#participa_es_juridica_8'),JSON1.participa_es_juridica_8.trim());
				setCheckBox(jq('#participa_es_pep_8'),JSON1.participa_es_pep_8.trim());
				if(JSON1.participa_es_juridica_8.trim()=='S'){
					participa_es_juridicaChange(jq('#participa_es_juridica_8'));
				}
				if(JSON1.participa_es_pep_8.trim()=='S'){
					participa_es_pepChange(jq('#participa_es_pep_8'));
				}
				setCheckBox(jq('#participa_es_rel_pep_8'),JSON1.participa_es_rel_pep_8.trim());

				jq('#pep_cargo_8').val(JSON1.pep_cargo_8.trim());
				jq('#pep_institucion_8').val(JSON1.pep_institucion_8.trim());
				jq('#pep_fecha_8').val(JSON1.pep_fecha_8.trim());

				if(JSON1.rel_rut_8_1.trim()!='' && jq.Rut.validar(JSON1.rel_rut_8_1.trim())){
					on_success(jq('#rel_rut_8_1'));
					jq('#rel_nombre_8_1').val(JSON1.rel_nombre_8_1.trim());
					jq('#rel_rut_8_1').val(JSON1.rel_rut_8_1.trim());
					setCombo('rel_pais_8_1',JSON1.rel_pais_8_1.trim());
				}

				if(JSON1.rel_rut_8_2.trim()!='' && jq.Rut.validar(JSON1.rel_rut_8_2.trim())){
					on_success(jq('#rel_rut_8_2'));
					jq('#rel_nombre_8_2').val(JSON1.rel_nombre_8_2.trim());
					jq('#rel_rut_8_2').val(JSON1.rel_rut_8_2.trim());
					setCombo('rel_pais_8_2',JSON1.rel_pais_8_2.trim());
				}

				if(JSON1.rel_rut_8_3.trim()!='' && jq.Rut.validar(JSON1.rel_rut_8_3.trim())){
					on_success(jq('#rel_rut_8_3'));
					jq('#rel_nombre_8_3').val(JSON1.rel_nombre_8_3.trim());
					jq('#rel_rut_8_3').val(JSON1.rel_rut_8_3.trim());
					setCombo('rel_pais_8_3',JSON1.rel_pais_8_3.trim());
				}
				
			}
			//
			//
			if(JSON1.participa_rut_9.trim()!='' && jq.Rut.validar(JSON1.participa_rut_9.trim())){
				jq('#participa_rut_9').val(JSON1.participa_rut_9.trim());
				on_success(jq('#participa_rut_9'));
				jq('#participa_razon_9').val(JSON1.participa_razon_9.trim());
				jq('#participa_porcentaje_9').val(JSON1.participa_porcentaje_9);
				setCombo('participa_pais_9',JSON1.participa_pais_9.trim());

				setCheckBox(jq('#participa_es_juridica_9'),JSON1.participa_es_juridica_9.trim());
				setCheckBox(jq('#participa_es_pep_9'),JSON1.participa_es_pep_9.trim());
				if(JSON1.participa_es_juridica_9.trim()=='S'){
					participa_es_juridicaChange(jq('#participa_es_juridica_9'));
				}
				if(JSON1.participa_es_pep_9.trim()=='S'){
					participa_es_pepChange(jq('#participa_es_pep_9'));
				}
				setCheckBox(jq('#participa_es_rel_pep_9'),JSON1.participa_es_rel_pep_9.trim());

				jq('#pep_cargo_9').val(JSON1.pep_cargo_9.trim());
				jq('#pep_institucion_9').val(JSON1.pep_institucion_9.trim());
				jq('#pep_fecha_9').val(JSON1.pep_fecha_9.trim());

				if(JSON1.rel_rut_9_1.trim()!='' && jq.Rut.validar(JSON1.rel_rut_9_1.trim())){
					on_success(jq('#rel_rut_9_1'));
					jq('#rel_nombre_9_1').val(JSON1.rel_nombre_9_1.trim());
					jq('#rel_rut_9_1').val(JSON1.rel_rut_9_1.trim());
					setCombo('rel_pais_9_1',JSON1.rel_pais_9_1.trim());
				}

				if(JSON1.rel_rut_9_2.trim()!='' && jq.Rut.validar(JSON1.rel_rut_9_2.trim())){
					on_success(jq('#rel_rut_9_2'));
					jq('#rel_nombre_9_2').val(JSON1.rel_nombre_9_2.trim());
					jq('#rel_rut_9_2').val(JSON1.rel_rut_9_2.trim());
					setCombo('rel_pais_9_2',JSON1.rel_pais_9_2.trim());
				}

				if(JSON1.rel_rut_9_3.trim()!='' && jq.Rut.validar(JSON1.rel_rut_9_3.trim())){
					on_success(jq('#rel_rut_9_3'));
					jq('#rel_nombre_9_3').val(JSON1.rel_nombre_9_3.trim());
					jq('#rel_rut_9_3').val(JSON1.rel_rut_9_3.trim());
					setCombo('rel_pais_9_3',JSON1.rel_pais_9_3.trim());
				}
				
			}
			//
			//
			if(JSON1.participa_rut_10.trim()!='' && jq.Rut.validar(JSON1.participa_rut_10.trim())){
				jq('#participa_rut_10').val(JSON1.participa_rut_10.trim());
				on_success(jq('#participa_rut_10'));
				jq('#participa_razon_10').val(JSON1.participa_razon_10.trim());
				jq('#participa_porcentaje_10').val(JSON1.participa_porcentaje_10);
				setCombo('participa_pais_10',JSON1.participa_pais_10.trim());

				setCheckBox(jq('#participa_es_juridica_10'),JSON1.participa_es_juridica_10.trim());
				setCheckBox(jq('#participa_es_pep_10'),JSON1.participa_es_pep_10.trim());
				if(JSON1.participa_es_juridica_10.trim()=='S'){
					participa_es_juridicaChange(jq('#participa_es_juridica_10'));
				}
				if(JSON1.participa_es_pep_10.trim()=='S'){
					participa_es_pepChange(jq('#participa_es_pep_10'));
				}
				setCheckBox(jq('#participa_es_rel_pep_10'),JSON1.participa_es_rel_pep_10.trim());

				jq('#pep_cargo_10').val(JSON1.pep_cargo_10.trim());
				jq('#pep_institucion_10').val(JSON1.pep_institucion_10.trim());
				jq('#pep_fecha_10').val(JSON1.pep_fecha_10.trim());

				if(JSON1.rel_rut_10_1.trim()!='' && jq.Rut.validar(JSON1.rel_rut_10_1.trim())){
					on_success(jq('#rel_rut_10_1'));
					jq('#rel_nombre_10_1').val(JSON1.rel_nombre_10_1.trim());
					jq('#rel_rut_10_1').val(JSON1.rel_rut_10_1.trim());
					setCombo('rel_pais_10_1',JSON1.rel_pais_10_1.trim());
				}

				if(JSON1.rel_rut_10_2.trim()!='' && jq.Rut.validar(JSON1.rel_rut_10_2.trim())){
					on_success(jq('#rel_rut_10_2'));
					jq('#rel_nombre_10_2').val(JSON1.rel_nombre_10_2.trim());
					jq('#rel_rut_10_2').val(JSON1.rel_rut_10_2.trim());
					setCombo('rel_pais_10_2',JSON1.rel_pais_10_2.trim());
				}

				if(JSON1.rel_rut_10_3.trim()!='' && jq.Rut.validar(JSON1.rel_rut_10_3.trim())){
					on_success(jq('#rel_rut_10_3'));
					jq('#rel_nombre_10_3').val(JSON1.rel_nombre_10_3.trim());
					jq('#rel_rut_10_3').val(JSON1.rel_rut_10_3.trim());
					setCombo('rel_pais_10_3',JSON1.rel_pais_10_3.trim());
				}
				
			}
			//
			jq('#cargo_contacto').val(JSON1.cargo_contacto.trim());
			jq('#ident_rep_legal').val(JSON1.ident_rep_legal.trim());
			ident_rep_legalChange().done(function(){
				jq('#fech_inicio_relacion_rep_legal').val(JSON1.fech_inicio_relacion_rep_legal.trim());
				jq('#nombre_rep_legal').val(JSON1.nombre_rep_legal.trim());
				jq('#apellido_pat_rep_legal').val(JSON1.apellido_pat_rep_legal.trim());
				jq('#apellido_mat_rep_legal').val(JSON1.apellido_mat_rep_legal.trim());
				jq('#fech_nacimiento_rep_legal').val(JSON1.fech_nacimiento_rep_legal.trim());
				setCombo('nacionalidad_rep_legal',JSON1.nacionalidad_rep_legal.trim());
			});
			
			setCheckBox(jq('#tiene_apoderado'),JSON1.tiene_apoderado.trim());
			tiene_apoderadoChange();

			jq('#identificador_apode').val(JSON1.identificador_apode.trim());
			var identificador_apodeCha = identificador_apodeChange();
			if(typeof identificador_apodeCha == 'undefined'){
				jq('#fech_inicio_relacion_apode').val(JSON1.fech_inicio_relacion_apode.trim());
				jq('#nombre_apode').val(JSON1.nombre_apode.trim());
				jq('#apellido_pat_apode').val(JSON1.apellido_pat_apode.trim());
				jq('#apellido_mat_apode').val(JSON1.apellido_mat_apode.trim());
			}else{
				identificador_apodeCha.done(function(){
					jq('#fech_inicio_relacion_apode').val(JSON1.fech_inicio_relacion_apode.trim());
					jq('#nombre_apode').val(JSON1.nombre_apode.trim());
					jq('#apellido_pat_apode').val(JSON1.apellido_pat_apode.trim());
					jq('#apellido_mat_apode').val(JSON1.apellido_mat_apode.trim());
				});
			}
			
			setCombo('venta_men_aprox',JSON1.venta_men_aprox.trim());
			setCombo('patrimonio_per_jur',JSON1.patrimonio_per_jur.trim());
			
			tabla_indChange();

       },
       error: function(error) {
          	alert('Error: ' + JSON.stringify(error));
       }
	});
}

function jsRemoveWindowLoadBlock() {
	jq( "#WindowLoadBlock" ).remove(); 
}
	 
function jsShowWindowLoadBlock() {
	jsRemoveWindowLoadBlock();
	var ancho = 0;
	var alto = 0;
	if (window.innerWidth == undefined) ancho = window.screen.width;
	else ancho = window.innerWidth;
	if (window.innerHeight == undefined) alto = window.screen.height;
	else alto = window.innerHeight;
		divb = document.createElement("div");
		divb.id = "WindowLoadBlock";
		divb.style.width = ancho + "px";
		divb.style.height = alto + "px";
		jq( "#big_container" ).append(divb);
		jq( "#WindowLoadBlock" ).css("position","fixed");
		jq( "#WindowLoadBlock" ).css("top","0px");
		jq( "#WindowLoadBlock" ).css("left","0px");
		jq( "#WindowLoadBlock" ).css("z-index","3200");
		jq( "#WindowLoadBlock" ).css("filter","alpha(opacity=65)");
		jq( "#WindowLoadBlock" ).css("-moz-opacity","65");
		jq( "#WindowLoadBlock" ).css("opacity","0.65");
		jq( "#WindowLoadBlock" ).css("background-color","#000000");
		inputb = document.createElement("input");
		inputb.id = "focusInput";
		inputb.type = "text";
		jq( "#WindowLoadBlock" ).append(inputb);
		jq( "#focusInput" ).focus();
		jq( "#focusInput" ).hide();
}



};