//CONTROLADOR NATURAL
Number.prototype.padLeft = function(base,chr){
   var  len = (String(base || 10).length - String(this).length)+1;
   return len > 0? new Array(len).join(chr || '0')+this : this;
}
var _peRfiles;
var _inD;
var _inDPorperfil;
var flag_existe = true;
var rutConyuge = '';
var controller = new controller();

function controller(){
	cargaInicial();

	// animaciónes colapso de subtitulos
	jq('.cony_cabece').nextUntil('tr.sub_collap').hide();
	jq('.cony_cabece').hide();
    jq('.sub_collap:not(.cony_cabece)').click(function(){
		jq(this).nextUntil('tr.sub_collap').fadeToggle();
	});

	jq('.cony_cabece').click(function(){
		if(flag_existe){
			jq(this).nextUntil('tr.sub_collap').fadeOut();
			flag_existe = false;
		}else{
			jq(this).nextUntil('tr.sub_collap',':not(.flag_existe)').fadeIn();
			flag_existe = true;
		}
	});


	//validaciones
	
	//valida rut vacio
	function on_empty (E){
		if(E.attr('id')=='ident_cliente'){

		}else if (E.attr('id')=='iden_repre'){
			iden_repreChange();
		}else if (E.attr('id')=='ident_conyuge' && E.val() != rutConyuge){
			rutConyuge = E.val();
			valida_conyuge();
		}else{

			var parent = E.parent().parent();
			for (i = 1; i < 6; i++) {
				if(E.hasClass('participa'+i)){
					E.removeClass('required');
					var participax = parent.find('.participa'+i+':not(.rut)');
					participax.attr('disabled','disabled');
					participax.not('.giro, .pais').val('');
					participax.removeAttr('checked');
					participax.removeClass('required');
					participax.removeClass('validation');
				}
			}
		}
		E.removeClass( "validation" );
	};
	//valida rut con error
	function on_error (E){
		if(E.attr('id')=='ident_cliente'){

		}else if (E.attr('id')=='iden_repre'){
			iden_repreChange();
		}else if (E.attr('id')=='ident_conyuge' && E.val() != rutConyuge){
			rutConyuge = E.val();
			habilita_conyuge();
		}else{
			var parent = E.parent().parent();
			for (i = 1; i < 6; i++) {
				if(E.hasClass('participa'+i)){
					E.addClass('required');
					var participax = parent.find('.participa'+i+':not(.rut)');
					participax.attr('disabled','disabled');
					participax.not('.giro, .pais').val('');
					participax.removeAttr('checked');
					participax.addClass('required');
				}
			}
		}
		E.addClass( "validation" ); 
	};
	//valida rut correcto
	function on_success (E){
		if(E.hasClass('no-permite-duplicado')){
			if(evaluaRepetidos(E)){
				alert('Este campo no permite duplicidad de rut');
			}
		}
		if(E.attr('id')=='ident_cliente'){
			if(E.val()==jq('#ident_conyuge').val()||E.val()==jq('#iden_repre').val()){
				alert('Este campo no permite duplicidad de rut');
				E.val('');
			}else{
				validaExistePersona(E);
			}
		}else if (E.attr('id')=='iden_repre'){
			iden_repreChange();
		}else if (E.attr('id')=='ident_conyuge' && E.val() != rutConyuge){
			rutConyuge = E.val();
			valida_conyuge();
		}else {
			var parent = E.parent().parent();
			for (i = 1; i < 6; i++) {
				if(E.hasClass('participa'+i)){
					E.addClass('required');
					var participax = parent.find('.participa'+i+':not(.rut)');
					participax.removeAttr('disabled');
					participax.addClass('required');
					participax.removeClass('validation');
				}
			}
		}
		E.removeClass( "validation" );
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
					jq('#'+id_region).removeClass('validation');
					if(id_region != 'region_contacto'){
						jq('#'+id_region).addClass('required');
						jq('#'+id_region).parent().prepend('<span class="req" style="color:red">* </span>');
					}
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

	function tipo_documentoChange() {
		if(jq( "#tipo_documento option:selected" ).val()=='RUT'){
			if(!jq('#ident_cliente').hasClass('rut')){
				jq('#ident_cliente').removeClass('pas');
				jq('#ident_cliente').addClass('rut');
				jq('#ident_cliente').val('');
				jq('#ident_cliente').Rut({
				  on_empty: on_empty,
				  on_error: on_error,
				  on_success: on_success,
				  format_on: 'change'
				});
			}
		}else{
			if(!jq('#ident_cliente').hasClass('pas')){
				jq('#ident_cliente').removeClass('rut');
				jq('#ident_cliente').addClass('pas');
				jq('#ident_cliente').val('');
				jq('#ident_cliente').Rut({
					unMaskRut: true
				});
				jq('#ident_cliente').change(function(){
					validaExistePersona(jq('#ident_cliente'));
				});
			}
		}
	}

	function doble_nacionalidadChange(){
		var doble_nacionalidad = jq('.doble_nacionalidad');
		if(jq('#doble_nacionalidad').is(':checked')){
			if(!doble_nacionalidad.hasClass('required')){
				doble_nacionalidad.removeAttr('disabled');
				doble_nacionalidad.addClass('required');
				doble_nacionalidad.parent().prepend('<span class="req" style="color:red">* </span>');
			}
		}else{
			doble_nacionalidad.attr('disabled','disabled');
			doble_nacionalidad.removeClass('required');
			doble_nacionalidad.removeClass('validation');
			doble_nacionalidad.parent().find('.req').remove();
		}
	}
	
	function situacion_laboral_conyugueChange() {
		var empleador_conyuge = jq('.empleador_conyuge');
		if(jq( "#situacion_laboral_conyugue option:selected" ).val()=='SILABCEMPL'){
			if(!empleador_conyuge.not('#act_economica_empleador_conyuge').hasClass('required')){
				empleador_conyuge.removeAttr('disabled');
				empleador_conyuge.not('#act_economica_empleador_conyuge').addClass('required');
				empleador_conyuge.parent().prepend('<span class="req" style="color:red">* </span>');
			}
		}else{
			empleador_conyuge.attr('disabled','disabled');
			empleador_conyuge.removeClass('required');
			empleador_conyuge.removeClass('validation');
			empleador_conyuge.parent().find('.req').remove();
		}
	}

	function situacion_laboralChange() {
		var laboral = jq('.laboral');
		if(jq( "#situacion_laboral option:selected" ).val()=='SILABCEMPL'){
			if(!laboral.hasClass('required')){
				laboral.removeAttr('disabled');
				laboral.addClass('required');
				laboral.parent().prepend('<span class="req" style="color:red">* </span>');
			}
		}else{
			laboral.attr('disabled','disabled');
			laboral.removeClass('required');
			laboral.removeClass('validation');
			laboral.parent().find('.req').remove();
		}
	}

	function opera_internacionalChange1() {
		var opera_internacional = jq('.opera_internacional');
		if(jq("input[name=opera_internacional]:checked").val()=='S'){
			if(!jq('#opera_internacional_pais_1').hasClass('required')){
				opera_internacional.removeAttr('disabled');
				jq('#opera_internacional_pais_1').addClass('required');
				jq('#opera_internacional_pais_1').parent().prepend('<span class="req" style="color:red">* </span>');
			}
		}else{
			opera_internacional.attr('disabled','disabled');
			jq('#opera_internacional_pais_1').removeClass('required');
			jq('#opera_internacional_pais_1').removeClass('validation');
			jq('#opera_internacional_pais_1').parent().find('.req').remove();
		}
	}

	function opera_internacionalChange2(E){
		var id_pais = E.attr('id');
		jq('.opera_internacional option').show();
		jq('.opera_internacional').each(function(i, item){
			var item = jq('option:selected', this).val();
			if(item != ''){
				jq('.opera_internacional:not("#'+id_pais+'") option[value='+item+']').hide();
			}
		});
	}

	function PEPChange() {
		var PEPs = jq('.PEP1, .PEP2, .PEP3');
		if(jq("input[name=PEP]:checked").val()=='S'){
			jq('.PEP1').addClass('required');
			PEPs.removeAttr('disabled');
		}else{
			jq('.PEP1').removeClass('required');
			PEPs.attr('disabled','disabled');
		}
	}

	function rel_PEPChange() {
		var parientes_PEP = jq('.pariente_pep1, .pariente_pep2, .pariente_pep3');
		if(jq("input[name=rel_PEP]:checked").val()=='S'){
			parientes_PEP.removeAttr('disabled');
		}else{
			parientes_PEP.attr('disabled','disabled');
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

	function dir_extranjeroChange() {
		var dir_extranjero = jq('.dir_extranjero');
		var no_dir_extranjero_complemento = jq('.dir_extranjero:not(#dir_extranjero_complemento)');
		if(jq("#dir_extranjero").is(':checked')){
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

	function tiene_contactoChange() {
		var contacto = jq('.contacto');
		if(jq("#tiene_contacto").is(':checked')){
			contacto.removeAttr('disabled');
		}else{
			contacto.attr('disabled','disabled');
			contacto.removeClass('validation');
		}
	}

	function tiene_representanteChange() {
		var representante = jq('.representante');
		if(jq("#tiene_representante").is(':checked')){
			if(!representante.hasClass('required')){
				representante.removeAttr('disabled');
				representante.addClass('required');
				representante.parent().prepend('<span class="req" style="color:red">* </span>');
			}
		}else{
			representante.attr('disabled','disabled');
			representante.removeClass('required');
			representante.removeClass('validation');
			representante.parent().find('.req').remove();
		}
	}

	function correoChange(E){
		if(existeCorreo(E.val())){
			E.removeClass( "validation" );
		}else{
			E.addClass( "validation" );
		}
	}

	function cue_bancaria_tipChange(){
		var cuenta_ban = jq('.cuenta_ban');
		if(jq("#cue_bancaria_tip").prop('selectedIndex')==0){
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
	


	jq("#tipo_documento").change(function(){tipo_documentoChange();});

	jq('#doble_nacionalidad').change(function(){doble_nacionalidadChange();});

	jq("#estado_civil").change(function () {valida_conyuge();});

	jq("#situacion_laboral_conyugue").change(function (){situacion_laboral_conyugueChange();});

	jq("#situacion_laboral").change(function (){situacion_laboralChange();});

	jq("input[name=opera_internacional]").change(function(){opera_internacionalChange1();});

	jq('.opera_internacional').change(function(){opera_internacionalChange2(jq(this));});
	
	jq("input[name=PEP]").change(function(){PEPChange();});
	
	jq("input[name=rel_PEP]").change(function(){rel_PEPChange();});
	
	jq('#ori_fon_inver').change(function(){ori_fon_inverChange();});
	
	jq("#dir_extranjero").change(function(){dir_extranjeroChange();});

	jq("#tiene_contacto").change(function(){tiene_contactoChange();});

	jq("#tiene_representante").change(function(){tiene_representanteChange();});
	
	jq('.correo').on('change', function(){correoChange(jq(this));});

	jq("#cue_bancaria_tip").change(function(){cue_bancaria_tipChange();});

	//direccion contacto
	jq('#dir_pais').change(function(){
		changePais('dir_pais','dir_region','dir_comuna','dir_ciudad');
	});
	jq('#dir_region').change(function(){
		changeRegion('dir_pais','dir_region','dir_comuna','dir_ciudad');
	});
	jq('#dir_comuna').change(function(){
		changeComuna('dir_comuna', 'dir_ciudad');
	});

	//direccion extranjero
	jq('#dir_extran_pais').change(function(){
		changePais('dir_extran_pais','','dir_extranjero_estado_provincia','dir_extranjero_ciudad');
	});

	jq('#dir_extranjero_estado_provincia').change(function(){
		changeComuna('dir_extranjero_estado_provincia', 'dir_extranjero_ciudad');
	});

	//direccion Comercial
	jq('#pais_direccion_laboral').change(function(){
		changePais('pais_direccion_laboral','region_direccion_laboral','comuna_direccion_laboral','ciudad_direccion_laboral');
	});
	jq('#region_direccion_laboral').change(function(){
		changeRegion('pais_direccion_laboral','region_direccion_laboral','comuna_direccion_laboral','ciudad_direccion_laboral');
	});
	jq('#comuna_direccion_laboral').change(function(){
		changeComuna('comuna_direccion_laboral', 'ciudad_direccion_laboral');
	});

	//direccion Contacto
	jq('#pais_contacto').change(function(){
		changePais('pais_contacto','region_contacto','comuna_contacto','ciudad_contacto');
	});
	jq('#region_contacto').change(function(){
		changeRegion('pais_contacto','region_contacto','comuna_contacto','ciudad_contacto');
	});
	jq('#comuna_contacto').change(function(){
		changeComuna('comuna_contacto', 'ciudad_contacto');
	});

	//direccion Contacto
	jq('#dir_pais_conyuge').change(function(){
		changePais('dir_pais_conyuge','dir_region_conyuge','dir_comuna_conyuge','dir_ciudad_conyuge');
	});
	jq('#dir_region_conyuge').change(function(){
		changeRegion('dir_pais_conyuge','dir_region_conyuge','dir_comuna_conyuge','dir_ciudad_conyuge');
	});
	jq('#dir_comuna_conyuge').change(function(){
		changeComuna('dir_comuna_conyuge', 'dir_ciudad_conyuge');
	});
	

	jq('input:radio[name=sexo]').change(function(){valida_conyuge();});


	jq('#cuenta_ban_origen').change(function(){cuenta_ban_origenChange();});














	jq('.telefono').mask('(099) (099) 000099999999', {
		placeholder: "(__) (__) _______"
	});
	jq('.giro').select2();
	jq('#cuenta_numero').mask('099');
	jq('.comision_uf').val('0');
	jq('#cuenta_numero').val('0');

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

	//listener acciones
	// agrega listener de validacion a todos los input con clase 'rut', extiende sus funciones desde JQuery.Rut
	jq('.rut').Rut({
	  on_empty: on_empty,
	  on_error: on_error,
	  on_success: on_success,
	  format_on: 'change'
	});

	jq('#telefono_particular, #telefono_comercial_laboral, #telefono_par_contacto').val('(56) (2)');
	jq('#telefono_celular, #telefono_particular_conyuge, #telefono_cel_contacto').val('(56) (9)');
	function valida_conyuge(){
		var promise;
		var rut_conyuge = jq('#ident_conyuge').val();
		var sexo_cliente = jq('input:radio[name=sexo]:checked').val();
		var estado_civil = jq('#estado_civil option:selected').val();
		if(rut_conyuge ==jq('#ident_cliente').val() && rut_conyuge != ""){
			alert('Este campo no permite duplicidad de rut');
			jq('#ident_conyuge').val('');
			rutConyuge = '';
		}else{
			if(estado_civil == 'ECIVICASAD'){
				jq('.cony_cabece').nextUntil('sub_collap').show();
				jq('.cony_cabece').show();

				jq('input:radio[name=sexo_conyuge]').attr('disabled','disabled');
				if(sexo_cliente =='M'){
					jq('#Femenino_conyuge').prop('checked',true);
					jq('#Masculino_conyuge').prop('checked',false);
				}else{
					jq('#Femenino_conyuge').prop('checked',false);
					jq('#Masculino_conyuge').prop('checked',true);
				}

				if(!jq('#regimen_conyugal').hasClass('required')){
					jq('#regimen_conyugal').removeAttr('disabled');
					jq('#regimen_conyugal').addClass('required');
					jq('#regimen_conyugal').parent().prepend('<span class="req" style="color:red">* </span>');
				}
				promise = traePersona(rut_conyuge).done(function(data){
					var Json = jq.parseJSON(data);
					if(Json.data.mensaje == "persona" || Json.data.mensaje == "solpersona"){
						if((Json.data.per_est_civil_id.trim() == 'ECIVIACUER' || Json.data.per_est_civil_id.trim() == 'ECIVICASAD')||(Json.data.per_sexo.trim() == sexo_cliente)){
							alert('el conyuge ingresado no puede ser del mismo sexo que el cliente o mantener un regimen conyugal vigente');
							jq('#ident_conyuge').val('');
							rutConyuge = '';
							jq('#ident_conyuge').removeClass('validation');
							habilita_conyuge();
						}else{
							deshabilita_conyuge(Json);
						}
					}else if(Json.data.mensaje == "0"){
						habilita_conyuge();
					}else{
						alert('Ha ocurrido un problema al ingresar esta persona');
						jq('#ident_conyuge').val('');
						rutConyuge = '';
						jq('#ident_conyuge').removeClass('validation');
						habilita_conyuge();
					}
				});
			}else if(estado_civil == 'ECIVIACUER'){
				jq('.cony_cabece').nextUntil('sub_collap').show();
				jq('.cony_cabece').show();

				jq('input:radio[name=sexo_conyuge]').removeAttr('disabled');
				if(!jq('#regimen_conyugal').hasClass('required')){
					jq('#regimen_conyugal').removeAttr('disabled');
					jq('#regimen_conyugal').addClass('required');
					jq('#regimen_conyugal').parent().prepend('<span class="req" style="color:red">* </span>');
				}
				promise = traePersona(rut_conyuge).done(function(data){
					var Json = jq.parseJSON(data);
					if(Json.data.mensaje == "persona" || Json.data.mensaje == "solpersona"){
						if((Json.data.per_est_civil_id.trim() == 'ECIVIACUER' || Json.data.per_est_civil_id.trim() == 'ECIVICASAD')){
							alert('el conyuge ingresado no puede mantener un regimen conyugal vigente');
							jq('#ident_conyuge').val('');
							rutConyuge = '';
							jq('#ident_conyuge').removeClass('validation');
							habilita_conyuge();
						}else{
							deshabilita_conyuge(Json);
						}
					}else if(Json.data.mensaje == "0"){
						habilita_conyuge();
					}else{
						alert('Ha ocurrido un problema al ingresar esta persona');
						jq('#ident_conyuge').val('');
						rutConyuge = '';
						jq('#ident_conyuge').removeClass('validation');
						habilita_conyuge();
					}
				});
			}else{
				var empleador_conyuge = jq('.empleador_conyuge');
				var conyuge_limpiar = jq('.conyuge');
				var empleador_conyuge = jq('.empleador_conyuge');
				var conyuge_requerido = jq('.conyuge:not(#profesion_conyuge)');
				conyuge_requerido.removeClass('required');
				conyuge_requerido.removeClass('validation');
				conyuge_requerido.attr('disabled','disabled');
				conyuge_requerido.parent().find('.req').remove();
				empleador_conyuge.removeClass('required');
				jq('#ident_conyuge').removeAttr('disabled');
				jq('#regimen_conyugal').attr('disabled','disabled');
				jq('#regimen_conyugal').removeClass('required');
				jq('#regimen_conyugal').parent().find('.req').remove();
				jq('.cony_cabece').nextUntil('tr.sub_collap').hide();
				jq('.cony_cabece').hide();

			}
		}
		return promise;
	}

	function habilita_conyuge(){
		var empleador_conyuge = jq('.empleador_conyuge:not(#act_economica_empleador_conyuge)');
		var conyuge_limpiar = jq('.conyuge:not(#ident_conyuge, #nivel_educacional_conyuge, #nacionalidad_conyuge, #dir_pais_conyuge, #dir_region_conyuge, #dir_comuna_conyuge, #situacion_laboral_conyugue, #profesion_conyuge)');
		var conyuge_requerido = jq('.conyuge:not(#profesion_conyuge)');
		if(!conyuge_requerido.hasClass('required')){
			conyuge_requerido.addClass('required');
			conyuge_requerido.removeClass('validation');
			conyuge_requerido.removeAttr('disabled');
			conyuge_requerido.parent().prepend('<span class="req" style="color:red">* </span>');
		}
		conyuge_limpiar.val('');
		empleador_conyuge.val('');
		empleador_conyuge.attr('disabled','disabled');
		jq('#nivel_educacional_conyuge').prop('selectedIndex', 0);
		jq('#profesion_conyuge').prop('selectedIndex', 0);
		jq('#dir_region_conyuge').prop('selectedIndex', 0);
		jq('#dir_comuna_conyuge').html('<option value="">Seleccione...</option>');
		jq('#situacion_laboral_conyugue').prop('selectedIndex', 0);
		jq("#nacionalidad_conyuge option[value=CL]").prop('selected', true);
		jq("#dir_pais_conyuge option[value=CL]").prop('selected', true);
		jq('#act_economica_empleador_conyuge').prop('selectedIndex', 0);
		jq('#act_economica_empleador_conyuge').attr('disabled','disabled');
		jq('#telefono_particular_conyuge').val('(56)(9)');

		jq('#flag_existe').nextUntil('tr.sub_collap').show();
		jq('#flag_existe').show();
		jq('#flag_existe').nextUntil('tr.sub_collap').removeClass('flag_existe');
		jq('#flag_existe').removeClass('flag_existe');
	}

	function deshabilita_conyuge(Json){
		var empleador_conyuge = jq('.empleador_conyuge');
		var conyuge_limpiar = jq('.conyuge');
		var empleador_conyuge = jq('.empleador_conyuge');
		var conyuge_requerido = jq('.conyuge:not(#profesion_conyuge)');

		conyuge_requerido.removeClass('required');
		conyuge_requerido.removeClass('validation');
		conyuge_requerido.attr('disabled','disabled');
		conyuge_requerido.parent().find('.req').remove();

		empleador_conyuge.removeClass('required');

		jq('#ident_conyuge').removeAttr('disabled');

		jq('input:radio[name=sexo_conyuge]').attr('disabled','disabled');
		if(Json.data.per_sexo.trim() =='M'){
			jq('#Femenino_conyuge').prop('checked',false);
			jq('#Masculino_conyuge').prop('checked',true);
		}else{
			jq('#Femenino_conyuge').prop('checked',true);
			jq('#Masculino_conyuge').prop('checked',false);
		}

		jq('#nombre_conyuge').val(Json.data.per_nombres.trim());
		jq('#apellido_pat_conyuge').val(Json.data.per_paterno.trim());
		jq('#apellido_mat_conyuge').val(Json.data.per_materno.trim());

		jq('#flag_existe').nextUntil('tr.sub_collap').hide();
		jq('#flag_existe').hide();
		jq('#flag_existe').nextUntil('tr.sub_collap').addClass('flag_existe');
		jq('#flag_existe').addClass('flag_existe');
	}

	function iden_repreChange(){
		if(jq('#iden_repre').val()==jq('#ident_cliente').val() && jq('#iden_repre').val()!= ""){
			alert('Este campo no permite duplicidad de rut');
			jq('#iden_repre').val('');
		}
		return traePersona(jq('#iden_repre').val()).done(function(data){
				var Json = jq.parseJSON(data);
				var rep_legal = jq('#nombre_representante, #apellido_pat_representante, #apellido_mat_representante, #fech_nacimiento_representante, #nacionalidad_representante');
				if(Json.data.mensaje == "persona"){

					jq('#nombre_representante').val(Json.data.per_nombres.trim());
					jq('#apellido_pat_representante').val(Json.data.per_paterno.trim());
					jq('#apellido_mat_representante').val(Json.data.per_materno.trim());
					var d = new Date(Json.data.per_FecNaci.trim());
					jq('#fech_nacimiento_representante').val((d.getDate()+1).padLeft()+'-'+(d.getMonth()+1).padLeft()+'-'+d.getFullYear());
					jq('#nacionalidad_representante option[value='+Json.data.per_pais_iso.trim()+']').prop('selected', true);
					rep_legal.attr('disabled','disabled');
					rep_legal.removeClass('required');
				}else if (Json.data.mensaje == "solpersona"){

					jq('#nombre_representante').val(Json.data.per_nombres.trim());
					jq('#apellido_pat_representante').val(Json.data.per_paterno.trim());
					jq('#apellido_mat_representante').val(Json.data.per_materno.trim());
					var d = new Date(Json.data.per_FecNaci.trim());
					jq('#fech_nacimiento_representante').val((d.getDate()+1).padLeft()+'-'+(d.getMonth()+1).padLeft()+'-'+d.getFullYear());
					jq('#nacionalidad_representante option[value='+Json.data.per_pais_iso.trim()+']').prop('selected', true);
					rep_legal.attr('disabled','disabled');
					rep_legal.removeClass('required');
				}else if(Json.data.mensaje == "0"){
					jq('#nombre_representante').val('');
					jq('#apellido_pat_representante').val('');
					jq('#apellido_mat_representante').val('');
					jq('#fech_nacimiento_representante').val('');
					jq('#nacionalidad_representante').prop('selectedIndex', 0);
					rep_legal.removeAttr('disabled');
					rep_legal.addClass('required');
				}
			});
	}



	//valida formulario
	jq('#_confirmar').click(function(){
		jsShowWindowLoadBlock();
		var inputs = jq('#enrolamiento_natural :input');
		if(validaCampos(inputs)){
			enviarDatos(inputs, 'normal');
		}else{
			alert("Datos Inválidos en el Formulario. Por favor revise y envié nuevamente");
			jsRemoveWindowLoadBlock();
		}
	});

	
	jq('#_borrador').click(function(){
		jsShowWindowLoadBlock();
		if(jq( "#tipo_documento option:selected" ).val()=='RUT'){
			var inputs = jq('#enrolamiento_natural :input');
			if(validaCamposBorrador(inputs)){
				enviarDatos(inputs, 'BOR');
			}else{
				alert("Datos Inválidos en el Formulario. Por favor revise y envíe nuevamente");
				jsRemoveWindowLoadBlock();
			}
		}else{
			alert('No se Permite Generar Borradores con Pasaportes');
			jsRemoveWindowLoadBlock();
		}
	});


	function cargaInicial(){
		//carga formulario
		jq.ajax({
		       type: 'POST',
		       url: 'enrolrapido.do?ServiceName=getInforEnrolamiento',
		       data: {"per_tip_per": "NAT"},
		       success: function (data){
		       				var js = jq.parseJSON(data);
		       		
		       		//SOLO PN
		       				var situacion_laboral = jq(".situacion_laboral");
		       				situacion_laboral.html('');
		       				situacion_laboral.append('<option value="">Seleccione...</option>');
		       				jq.each(js.situacionesLaborales, function(i, item){
		       					situacion_laboral.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
		       				
		       				
		       		//SOLO PN
		       				var regimen_conyugal = jq("#regimen_conyugal");
		       				regimen_conyugal.html('');
		       				regimen_conyugal.append('<option value="">Seleccione...</option>');
		       				jq.each(js.regConyugal, function(i, item){
		       					if('RCONYSINRE'!=item.id.trim()){
		       						regimen_conyugal.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
		       					}
				    	  	});
				    	  	jq("#regimen_conyugal option[value=RCONYSINRE]").prop('selected', true);

		       		//SOLO PN
		       				var estado_civil = jq("#estado_civil");
		       				estado_civil.html('');
		       				estado_civil.append('<option value="">Seleccione...</option>');
		       				jq.each(js.estadosCiviles, function(i, item){
		       					estado_civil.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
				    	  	jq("#estado_civil option[value=ECIVISOLTE]").prop('selected', true);

					//SOLO PN
		       				var patrimonio_no_financiero = jq("#patrimonio_no_financiero");
		       				patrimonio_no_financiero.html('');
		       				patrimonio_no_financiero.append('<option value="">Seleccione...</option>');
		       				jq.each(js.patrimonioNoFinanciero, function(i, item){
				    			patrimonio_no_financiero.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});

					//SOLO PN
		       				var patrimonio_financiero = jq("#patrimonio_financiero");
		       				patrimonio_financiero.html('');
		       				patrimonio_financiero.append('<option value="">Seleccione...</option>');
		       				jq.each(js.patrimonioFinanciero, function(i, item){
				    			patrimonio_financiero.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});

					//SOLO PN
		       				var ingreso_anual_aproximada = jq("#ingreso_anual_aproximada");
		       				ingreso_anual_aproximada.html('');
		       				ingreso_anual_aproximada.append('<option value="">Seleccione...</option>');
		       				jq.each(js.ingresoOcasional, function(i, item){
				    			ingreso_anual_aproximada.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});

					//SOLO PN
		       				var ingreso_mensual_aproximada = jq("#ingreso_mensual_aproximada");
		       				ingreso_mensual_aproximada.html('');
		       				ingreso_mensual_aproximada.append('<option value="">Seleccione...</option>');
		       				jq.each(js.ingresoMensual, function(i, item){
				    			ingreso_mensual_aproximada.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});

					
					//SOLO PN
		       				var tipo_vivienda = jq("#tipo_vivienda");
		       				tipo_vivienda.html('');
		       				tipo_vivienda.append('<option value="">Seleccione...</option>');
		       				jq.each(js.TipoVivienda, function(i, item){
				    			tipo_vivienda.append('<option value="'+item.id.trim()+'">'+item.glosa.trim()+'</option>');
				    	  	});

					//SOLO PN
		       				var tipo_documento = jq("#tipo_documento");
		       				tipo_documento.html('');
		       				jq.each(js.tipoDocumentos, function(i, item){
				    			tipo_documento.append('<option value="'+item.td_codigo.trim()+'">'+item.td_nombre.trim()+'</option>');
				    	  	});
				    	  	jq("#tipo_documento option[value=RUT]").prop('selected', true);
		       		//SOLO PN
		       				var profesion = jq("#profesion, #profesion_conyuge");
				    	  	profesion.html('');
			    		  	jq.each(js.profesiones, function(i, item){
			    		  		var id;
			    		  		item.id.trim()=="-1"? id = "0": id = item.id.trim();
				    			profesion.append('<option value="'+id+'">'+item.value.trim()+'</option>');
				    	  	});

					//SOLO PN
				    	  	var nivel_educacional = jq("#nivel_educacional, #nivel_educacional_conyuge");
				    	  	nivel_educacional.html('');
				    	  	nivel_educacional.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.NivelEducacional, function(i, item){
				    			nivel_educacional.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
				    	  	
			    	//SOLO PN
				    	  	var tipo_relacion_representante = jq("#tipo_relacion_representante");
				    	  	tipo_relacion_representante.html('');
				    	  	tipo_relacion_representante.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.tRelacion, function(i, item){
			    		  		if(item.id.trim() == 'TRELAAUTOR'||item.id.trim() == 'TRELALEGAL'){
			    		  			tipo_relacion_representante.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
			    		  		}
				    	  	});

					//COMUN
		       				var rel_corr_ncg = jq("#rel_corr_ncg");
				    	  	rel_corr_ncg.html('');
				    	  	rel_corr_ncg.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.relaCorr, function(i, item){
			    		  		if(item.data.trim() == 'RELCOOTRA' || item.data.trim() == 'RELCODIR' ||item.data.trim() == 'RELCONING' ||item.data.trim() == 'RELCOSOC' ||item.data.trim() == 'RELCOTRA'){
			    		  			rel_corr_ncg.append('<option value="'+item.data.trim()+'">'+item.label.trim()+'</option>');
			    		  		}
				    	  	});
				    	  	jq("#rel_corr_ncg option[value=RELCONING]").prop('selected', true);
					//COMUN
			    		  	var cuen_bancar_mon = jq("#cuen_bancar_mon");
				    	  	cuen_bancar_mon.html('');
				    	  	cuen_bancar_mon.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.Monedas, function(i, item){
				    			cuen_bancar_mon.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
					//COMUN
			    		  	var tipo_cli = jq("#tipo_cli");
				    	  	tipo_cli.html('');
				    	  	tipo_cli.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.TipoCliente, function(i, item){
				    			tipo_cli.append('<option value="'+item.data.trim()+'">'+item.label.trim()+'</option>');
				    	  	});
				    	  	jq("#tipo_cli option[value=TCLIINVER]").prop('selected', true);
					//COMUN
				    	  	var ori_fon_inver = jq("#ori_fon_inver");
							ori_fon_inver.html('');
				    	  	ori_fon_inver.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.OrigenFondosInvertir, function(i, item){
				    			ori_fon_inver.append('<option value="'+item.data.trim()+'">'+item.label.trim()+'</option>');
				    	  	});
							
					//COMUN
			    		  	var cuenta_tipo_perfil = jq("#cuenta_tipo_perfil");
							cuenta_tipo_perfil.html('');
				    	  	cuenta_tipo_perfil.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.perfilCome, function(i, item){
				    			cuenta_tipo_perfil.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
				    	  	jq("#cuenta_tipo_perfil option[value=P7]").prop('selected', true);
					//COMUN
							var cuenta_prop = jq("#cuenta_prop");
							cuenta_prop.html('');
				    	  	cuenta_prop.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.propositos, function(i, item){
				    			cuenta_prop.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
				    	  	jq("#cuenta_prop option[value=PROPCINTER]").prop('selected', true);
				    	  	
					//COMUN
							var clas_fatca = jq("#clas_fatca");
							clas_fatca.html('');
			    		  	jq.each(js.ClasFATCA, function(i, item){
				    			clas_fatca.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
			    		  	jq("#clas_fatca option[value=CLAFANONUS]").prop('selected', true);

					//COMUN
			    		  	var cue_bancaria_tip = jq("#cue_bancaria_tip");
				    	  	cue_bancaria_tip.html('');
				    	  	cue_bancaria_tip.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.tCtaBancaria, function(i, item){
				    			cue_bancaria_tip.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
				    	  	
					//COMUN
			    		  	var mecanismo_abono = jq("#mecanismo_abono");
				    	  	mecanismo_abono.html('');
				    	  	mecanismo_abono.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.MedioPagoAbonoCliente, function(i, item){
				    			mecanismo_abono.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
					//COMUN
			    		  	var pais = jq(".pais");
				    	  	pais.html('');
				    	  	pais.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.paises, function(i, item){
				    			pais.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});

				    	  	jq(".pais:not('#dir_extran_pais, #pais_doble_nacionalidad, .opera_internacional') option[value=CL]").prop('selected', true);
				    	  	jq('#dir_extran_pais option[value=CL]').remove();
					//COMUN
				    	  	var giro = jq(".giro");
				    	  	giro.html('');
			    		  	jq.each(js.actividadesComerciales, function(i, item){
				    			var id;
			    		  		item.id.trim()=="-1"? id = "0": id = item.id.trim()
				    			giro.append('<option value="'+id+'">'+item.value.trim()+'</option>');
				    	  	});
					//COMUN
				    	  	var region = jq(".region");
				    	  	region.html('');
				    	  	region.append('<option value="0">Seleccione...</option>');
			    		  	jq.each(js.regiones, function(i, item){
				    			region.append('<option value="'+item.value.trim()+'">'+item.nemo.trim()+'</option>');
				    	  	});
					//COMUN
				    	  	var banco = jq(".banco");
				    	  	banco.html('');
				    	  	banco.append('<option value="">Seleccione...</option>');
			    		  	jq.each(js.Bancos, function(i, item){
				    			banco.append('<option value="'+item.id.trim()+'">'+item.value.trim()+'</option>');
				    	  	});
					//COMUN
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
			per_tip_per ["value"] = "NAT";
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
											e.removeClass('validation');									}
									}else{
										e.removeClass('validation');
									}
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
									e.removeClass('validation');
								}else{
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
			if(jq( "#tipo_documento option:selected" ).val()=='RUT'){
				var per_id = jq.Rut.quitarFormato_rut(E.val());
				var dv = jq.Rut.quitarFormato_dv(E.val());
				data["contexto"] = "ENR";
				data["rut"] = per_id;
				data["dv"] = dv;
				data["tipoDoc"] = "RUT";
			}else{
				data["contexto"] = "ENR";
				data["rut"] = E.val();
				data["dv"] = "";
				data["tipoDoc"] = "PAS";
			}
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
       					alert("El Rut Ingresado Corresponde a una Persona Juridica, para modificar dirijase al formulario correspondiente");
       					E.val("");
       					return false;
       				}else if (js.statusCode=="11"||js.statusCode=="12"){
       					traeBorrador(per_id);
       					return true;
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

	jq("#tabla_ind").on('change','[name=COCUS]',function(){
		var cuenta_comision_uf = jq('#cuenta_comision_uf');
		if(jq(this).val()=='S'){
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
		jq("#regimen_conyugal option[value=RCONYSINRE]").prop('selected', true);
		jq("#estado_civil option[value=ECIVISOLTE]").prop('selected', true);
		jq("#tipo_documento option[value=RUT]").prop('selected', true);
		jq("#rel_corr_ncg option[value=RELCONING]").prop('selected', true);
		jq("#tipo_cli option[value=TCLIINVER]").prop('selected', true);
		jq("#cuenta_tipo_perfil option[value=P7]").prop('selected', true);
		jq("#cuenta_prop option[value=PROPCINTER]").prop('selected', true);
		jq("#clas_fatca option[value=CLAFANONUS]").prop('selected', true);
		jq(".pais:not('#dir_extran_pais, #pais_doble_nacionalidad, .opera_internacional') option[value=CL]").prop('selected', true);
		jq('#dir_extran_pais option[value=CL]').remove();
		if(!jq('#ident_cliente').hasClass('rut')){
			jq('#ident_cliente').removeClass('pas');
			jq('#ident_cliente').addClass('rut');
			jq('#ident_cliente').val('');
			jq('#ident_cliente').Rut({
			  on_empty: on_empty,
			  on_error: on_error,
			  on_success: on_success,
			  format_on: 'change'
			});
		}
		jq('.comision_uf').val('0');
		jq('#cuenta_numero').val('0');
		jq('#telefono_particular, #telefono_comercial_laboral, #telefono_par_contacto').val('(56) (2)');
		jq('#telefono_celular, #telefono_particular_conyuge, #telefono_cel_contacto').val('(56) (9)');
		jq('.giro').select2().val("0").trigger("change");
		var doble_nacionalidad = jq('.doble_nacionalidad');
			doble_nacionalidad.attr('disabled','disabled');
			doble_nacionalidad.removeClass('required');
			doble_nacionalidad.removeClass('validation');
			doble_nacionalidad.parent().find('.req').remove();
		var conyuge = jq('.conyuge');
			conyuge.removeClass('required');
			conyuge.removeClass('validation');
			conyuge.parent().find('.req').remove();
			jq('.cony_cabece').nextUntil('tr.sub_collap').hide();
			jq('.cony_cabece').hide();
			jq('#situacion_laboral_conyugue').prop('selectedIndex', 0);
			jq('#regimen_conyugal').attr('disabled','disabled');
			jq('#regimen_conyugal').removeClass('required');
			jq('#regimen_conyugal').removeClass('validation');
			jq('#regimen_conyugal').parent().find('.req').remove();
		var empleador_conyuge = jq('.empleador_conyuge');
			empleador_conyuge.attr('disabled','disabled');
			empleador_conyuge.removeClass('required');
			empleador_conyuge.removeClass('validation');
			empleador_conyuge.parent().find('.req').remove();
		var laboral = jq('.laboral');
			laboral.attr('disabled','disabled');
			laboral.removeClass('required');
			laboral.removeClass('validation');
			laboral.parent().find('.req').remove();
		var opera_internacional = jq('.opera_internacional');
			opera_internacional.attr('disabled','disabled');
			jq('#opera_internacional_pais_1').removeClass('required');
			jq('#opera_internacional_pais_1').removeClass('validation');
			jq('#opera_internacional_pais_1').parent().find('.req').remove();
			jq('.opera_internacional option').show();
		var PEPs = jq('.PEP1, .PEP2, .PEP3');
			jq('.PEP1').removeClass('required');
			PEPs.attr('disabled','disabled');
		var parientes_PEP = jq('.pariente_pep1, .pariente_pep2, .pariente_pep3');
			parientes_PEP.attr('disabled','disabled');
			jq('#ori_fon_inver_otro').attr('disabled','disabled');
			jq('#ori_fon_inver_otro').removeClass('required');
			jq('#ori_fon_inver_otro').parent().find('.req').remove();
		var dir_extranjero = jq('.dir_extranjero');
			dir_extranjero.attr('disabled','disabled');
			dir_extranjero.removeClass('required');
			dir_extranjero.removeClass('validation');
			dir_extranjero.parent().find('.req').remove();
		var contacto = jq('.contacto');
			contacto.attr('disabled','disabled');
			contacto.removeClass('validation');
		var representante = jq('.representante');
			representante.attr('disabled','disabled');
			representante.removeClass('required');
			representante.removeClass('validation');
			representante.parent().find('.req').remove();
		var cuenta_ban = jq('.cuenta_ban');
			cuenta_ban.removeClass('required');
			cuenta_ban.removeClass('validation');
			cuenta_ban.attr('disabled','disabled');
			cuenta_ban.parent().find('.req').remove();
		var cuenta_comision_uf = jq('#cuenta_comision_uf');
			cuenta_comision_uf.removeClass('required');
			cuenta_comision_uf.removeClass('validation');
			cuenta_comision_uf.attr('disabled','disabled');
			cuenta_comision_uf.parent().find('.req').remove();
			cuenta_comision_uf.val('0');
		jq('.participa :input:not(.rut)').attr('disabled','disabled');
		jq('.participa :input').removeClass('required');
		jq('.participa :input').removeClass('validation');
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



				if(JSON1.participa_rut_1.trim()!='' && jq.Rut.validar(JSON1.participa_rut_1.trim())){
					jq('#participa_rut_1').val(JSON1.participa_rut_1.trim());
					on_success(jq('#participa_rut_1'));
					jq('#participa_razon_1').val(JSON1.participa_razon_1.trim());
					jq('#participa_porcentaje_1').val(JSON1.participa_porcentaje_1);
					setCombo('participa_pais_1',JSON1.participa_pais_1.trim());
					jq('#participa_realacion_1').val(JSON1.participa_realacion_1.trim());
					setCombo('participa_actividad_economica_1',JSON1.participa_actividad_economica_1);
					jq('#participa_actividad_economica_1').select2().val(JSON1.participa_actividad_economica_1).trigger("change");
				}
				if(JSON1.participa_rut_2.trim()!='' && jq.Rut.validar(JSON1.participa_rut_2.trim())){
					jq('#participa_rut_2').val(JSON1.participa_rut_2.trim());
					on_success(jq('#participa_rut_2'));
					jq('#participa_razon_2').val(JSON1.participa_razon_2.trim());
					jq('#participa_porcentaje_2').val(JSON1.participa_porcentaje_2);
					setCombo('participa_pais_2',JSON1.participa_pais_2.trim());
					jq('#participa_realacion_2').val(JSON1.participa_realacion_2.trim());
					setCombo('participa_actividad_economica_2',JSON1.participa_actividad_economica_2);
					jq('#participa_actividad_economica_2').select2().val(JSON1.participa_actividad_economica_2).trigger("change");
				}
				if(JSON1.participa_rut_3.trim()!='' && jq.Rut.validar(JSON1.participa_rut_3.trim())){
					jq('#participa_rut_3').val(JSON1.participa_rut_3.trim());
					on_success(jq('#participa_rut_3'));
					jq('#participa_razon_3').val(JSON1.participa_razon_3.trim());
					jq('#participa_porcentaje_3').val(JSON1.participa_porcentaje_3);
					setCombo('participa_pais_3',JSON1.participa_pais_3.trim());
					jq('#participa_realacion_3').val(JSON1.participa_realacion_3.trim());
					setCombo('participa_actividad_economica_3',JSON1.participa_actividad_economica_3);
					jq('#participa_actividad_economica_3').select2().val(JSON1.participa_actividad_economica_3).trigger("change");
				}
				if(JSON1.participa_rut_4.trim()!='' && jq.Rut.validar(JSON1.participa_rut_4.trim())){
					jq('#participa_rut_4').val(JSON1.participa_rut_4.trim());
					on_success(jq('#participa_rut_4'));
					jq('#participa_razon_4').val(JSON1.participa_razon_4.trim());
					jq('#participa_porcentaje_4').val(JSON1.participa_porcentaje_4);
					setCombo('participa_pais_4',JSON1.participa_pais_4.trim());
					jq('#participa_realacion_4').val(JSON1.participa_realacion_4.trim());
					setCombo('participa_actividad_economica_4',JSON1.participa_actividad_economica_4);
					jq('#participa_actividad_economica_4').select2().val(JSON1.participa_actividad_economica_4).trigger("change");
				}
				if(JSON1.participa_rut_5.trim()!='' && jq.Rut.validar(JSON1.participa_rut_5.trim())){
					jq('#participa_rut_5').val(JSON1.participa_rut_5.trim());
					on_success(jq('#participa_rut_5'));
					jq('#participa_razon_5').val(JSON1.participa_razon_5.trim());
					jq('#participa_porcentaje_5').val(JSON1.participa_porcentaje_5);
					setCombo('participa_pais_5',JSON1.participa_pais_5.trim());
					jq('#participa_realacion_5').val(JSON1.participa_realacion_5.trim());
					setCombo('participa_actividad_economica_5',JSON1.participa_actividad_economica_5);
					jq('#participa_actividad_economica_5').select2().val(JSON1.participa_actividad_economica_5).trigger("change");
				}
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
				cuenta_ban_origenChange().done(function(){
					setCombo('cuenta_ban_banco',JSON1.cuenta_ban_banco.trim());
				});
				jq('#cuenta_ban_sucursal').val(JSON1.cuenta_ban_sucursal.trim());
				jq('#cuenta_ban_numero').val(JSON1.cuenta_ban_numero.trim());
				setCombo('cuen_bancar_mon',JSON1.cuen_bancar_mon.trim());

		//NATURAL

				setCombo('tipo_documento',JSON1.tipo_documento.trim());
				tipo_documentoChange();
				jq('#nombres').val(JSON1.nombres.trim());
				jq('#ape_paterno').val(JSON1.ape_paterno.trim());
				jq('#ape_materno').val(JSON1.ape_materno.trim());
				
				if(JSON1.sexo.trim() == 'M' || JSON1.sexo.trim() == 'm'){
					jq('input[name=sexo][value=M]').prop('checked',true);
					jq('input[name=sexo][value=F]').prop('checked',false);
				}else{
					jq('input[name=sexo][value=F]').prop('checked',true);
					jq('input[name=sexo][value=M]').prop('checked',false);
				}
				
				setCombo('pais_nacimiento',JSON1.pais_nacimiento.trim());
				setCombo('pais_residencia',JSON1.pais_residencia.trim());
				setCombo('pais_nacionalidad',JSON1.pais_nacionalidad.trim());
				setCheckBox(jq('#doble_nacionalidad'),JSON1.doble_nacionalidad.trim());
				doble_nacionalidadChange();
				setCombo('pais_doble_nacionalidad',JSON1.pais_doble_nacionalidad.trim());
				jq('#identificacion_tributaria_doble_nacionalidad').val(JSON1.identificacion_tributaria_doble_nacionalidad.trim());
				setCombo('profesion',JSON1.profesion);
				setCombo('nivel_educacional',JSON1.nivel_educacional.trim());
				setCombo('tipo_vivienda',JSON1.tipo_vivienda.trim());
				setCombo('estado_civil',JSON1.estado_civil.trim());
				setCombo('regimen_conyugal',JSON1.regimen_conyugal.trim());
				setCombo('situacion_laboral',JSON1.situacion_laboral.trim());
				situacion_laboralChange();
				jq('#cargo_laboral').val(JSON1.cargo_laboral.trim());
				jq('#antiguedad_laboral').val(JSON1.antiguedad_laboral.trim());

				jq('#rut_empleador_laboral').val(JSON1.rut_empleador_laboral.trim());
				jq('#razon_social_laboral').val(JSON1.razon_social_laboral.trim());
				jq('#nombre_fantasia_laboral').val(JSON1.nombre_fantasia_laboral.trim());
				setCombo('actividad_economica_laboral',JSON1.actividad_economica_laboral);

				jq('#actividad_economica_laboral').select2().val(JSON1.actividad_economica_laboral).trigger("change");

				jq('#telefono_comercial_laboral').val(JSON1.telefono_comercial_laboral.trim());

				setDirecciones(JSON1.pais_direccion_laboral, 'pais_direccion_laboral', JSON1.region_direccion_laboral, 'region_direccion_laboral', JSON1.comuna_direccion_laboral, 'comuna_direccion_laboral', 'ciudad_direccion_laboral');

				jq('#direccion_direccion_laboral').val(JSON1.direccion_direccion_laboral.trim());

				jq('#ident_conyuge').val(JSON1.ident_conyuge.trim());
				var valida_conyu = valida_conyuge();
				if ( typeof valida_conyu == 'undefined'){
					setRadio('sexo_conyuge',JSON1.sexo_conyuge.trim());
					jq('#nombre_conyuge').val(JSON1.nombre_conyuge.trim());
					jq('#apellido_pat_conyuge').val(JSON1.apellido_pat_conyuge.trim());
					jq('#apellido_mat_conyuge').val(JSON1.apellido_mat_conyuge.trim());
					setCombo('profesion_conyuge',JSON1.profesion_conyuge);
					setCombo('nivel_educacional_conyuge',JSON1.nivel_educacional_conyuge.trim());
					setCombo('nacionalidad_conyuge',JSON1.nacionalidad_conyuge.trim());

					jq('#telefono_particular_conyuge').val(JSON1.telefono_particular_conyuge.trim());

					setDirecciones(JSON1.dir_pais_conyuge, 'dir_pais_conyuge', JSON1.dir_region_conyuge, 'dir_region_conyuge', JSON1.dir_comuna_conyuge, 'dir_comuna_conyuge', 'dir_ciudad_conyuge');

					jq('#dir_direccion_conyuge').val(JSON1.dir_direccion_conyuge.trim());
					setCombo('situacion_laboral_conyugue',JSON1.situacion_laboral_conyugue.trim());
					situacion_laboral_conyugueChange();

					jq('#identificador_empleador_conyuge').val(JSON1.identificador_empleador_conyuge.trim());
					jq('#cargo_empleador_conyuge').val(JSON1.cargo_empleador_conyuge.trim());
					setCombo('act_economica_empleador_conyuge',JSON1.act_economica_empleador_conyuge);
					jq('#act_economica_empleador_conyuge').select2().val(JSON1.act_economica_empleador_conyuge).trigger("change");
					jq('#razon_social_empleador_conyuge').val(JSON1.razon_social_empleador_conyuge.trim());
					jq('#nombre_fantasia_empleador_conyuge').val(JSON1.nombre_fantasia_empleador_conyuge.trim());
				}else{
					valida_conyu.done(function(){
						setRadio('sexo_conyuge',JSON1.sexo_conyuge.trim());
						jq('#nombre_conyuge').val(JSON1.nombre_conyuge.trim());
						jq('#apellido_pat_conyuge').val(JSON1.apellido_pat_conyuge.trim());
						jq('#apellido_mat_conyuge').val(JSON1.apellido_mat_conyuge.trim());
						setCombo('profesion_conyuge',JSON1.profesion_conyuge);
						setCombo('nivel_educacional_conyuge',JSON1.nivel_educacional_conyuge.trim());
						setCombo('nacionalidad_conyuge',JSON1.nacionalidad_conyuge.trim());

						jq('#telefono_particular_conyuge').val(JSON1.telefono_particular_conyuge.trim());

						setDirecciones(JSON1.dir_pais_conyuge, 'dir_pais_conyuge', JSON1.dir_region_conyuge, 'dir_region_conyuge', JSON1.dir_comuna_conyuge, 'dir_comuna_conyuge', 'dir_ciudad_conyuge');

						jq('#dir_direccion_conyuge').val(JSON1.dir_direccion_conyuge.trim());
						setCombo('situacion_laboral_conyugue',JSON1.situacion_laboral_conyugue.trim());
						situacion_laboral_conyugueChange();

						jq('#identificador_empleador_conyuge').val(JSON1.identificador_empleador_conyuge.trim());
						jq('#cargo_empleador_conyuge').val(JSON1.cargo_empleador_conyuge.trim());
						setCombo('act_economica_empleador_conyuge',JSON1.act_economica_empleador_conyuge);
						jq('#act_economica_empleador_conyuge').select2().val(JSON1.act_economica_empleador_conyuge).trigger("change");
						jq('#razon_social_empleador_conyuge').val(JSON1.razon_social_empleador_conyuge.trim());
						jq('#nombre_fantasia_empleador_conyuge').val(JSON1.nombre_fantasia_empleador_conyuge.trim());
					});
				}
				
				
				setCheckBox(jq('#tiene_representante'),JSON1.tiene_representante.trim());
				tiene_representanteChange();
				if(JSON1.tiene_representante.trim()=='S'){
					jq('#iden_repre').val(JSON1.iden_repre.trim());
					iden_repreChange().done(function(data){
						var Json = jq.parseJSON(data);
						if(Json.data.mensaje=="0"){
							setCombo('tipo_relacion_representante',JSON1.tipo_relacion_representante.trim());
							jq('#fech_inicio_relacion_representante').val(JSON1.fech_inicio_relacion_representante.trim());
							jq('#nombre_representante').val(JSON1.nombre_representante.trim());
							jq('#apellido_pat_representante').val(JSON1.apellido_pat_representante.trim());
							jq('#apellido_mat_representante').val(JSON1.apellido_mat_representante.trim());
							jq('#fech_nacimiento_representante').val(JSON1.fech_nacimiento_representante.trim());
							setCombo('nacionalidad_representante',JSON1.nacionalidad_representante.trim());
						}else{
							setCombo('tipo_relacion_representante',JSON1.tipo_relacion_representante.trim());
							jq('#fech_inicio_relacion_representante').val(JSON1.fech_inicio_relacion_representante.trim());
						}
					});
				}
				setRadio('PEP',JSON1.PEP.trim());
				PEPChange();
				jq('#pep_cargo1').val(JSON1.pep_cargo1.trim());
				jq('#pep_institucion1').val(JSON1.pep_institucion1.trim());
				jq('#pep_fecha_servicio1').val(JSON1.pep_fecha_servicio1.trim());
				jq('#pep_cargo2').val(JSON1.pep_cargo2.trim());
				jq('#pep_institucion2').val(JSON1.pep_institucion2.trim());
				jq('#pep_fecha_servicio2').val(JSON1.pep_fecha_servicio2.trim());
				setRadio('rel_PEP',JSON1.rel_PEP.trim());
				rel_PEPChange();
				jq('#pariente_pep_nombre_1').val(JSON1.pariente_pep_nombre_1.trim());
				jq('#pariente_pep_cargo_1').val(JSON1.pariente_pep_cargo_1.trim());
				jq('#pariente_pep_institucion_1').val(JSON1.pariente_pep_institucion_1.trim());
				jq('#pariente_pep_parentesco_1').val(JSON1.pariente_pep_parentesco_1.trim());
				jq('#pariente_pep_nombre_2').val(JSON1.pariente_pep_nombre_2.trim());
				jq('#pariente_pep_cargo_2').val(JSON1.pariente_pep_cargo_2.trim());
				jq('#pariente_pep_institucion_2').val(JSON1.pariente_pep_institucion_2.trim());
				jq('#pariente_pep_parentesco_2').val(JSON1.pariente_pep_parentesco_2.trim());

				setRadio('opera_internacional',JSON1.opera_internacional.trim());
				opera_internacionalChange1();

				setCombo('opera_internacional_pais_1',JSON1.opera_internacional_pais_1.trim());
				opera_internacionalChange2(jq('#opera_internacional_pais_1'));
				setCombo('opera_internacional_pais_2',JSON1.opera_internacional_pais_2.trim());
				opera_internacionalChange2(jq('#opera_internacional_pais_2'));
				setCombo('opera_internacional_pais_3',JSON1.opera_internacional_pais_3.trim());
				opera_internacionalChange2(jq('#opera_internacional_pais_3'));
				setCombo('ingreso_mensual_aproximada',JSON1.ingreso_mensual_aproximada.trim());
				setCombo('ingreso_anual_aproximada',JSON1.ingreso_anual_aproximada.trim());
				setCombo('patrimonio_financiero',JSON1.patrimonio_financiero.trim());
				setCombo('patrimonio_no_financiero',JSON1.patrimonio_no_financiero.trim());
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