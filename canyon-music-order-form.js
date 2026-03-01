document.addEventListener('DOMContentLoaded',function(){
// Warmup ping: silently wake Render server on page load so it's ready by submit time.
fetch('https://canyon-music-webhook.onrender.com/ping',{method:'GET',cache:'no-store'}).catch(function(){});

(function(){
  function gO(){var t=Date.now().toString(36).toUpperCase().slice(-5),r=Math.random().toString(36).toUpperCase().slice(2,5);return'CM-'+t+r;}
  function g(id){return document.getElementById(id);}

  var form=g('cmForm'),btn=g('cmBtn'),succ=g('cmSuccess'),oNum=g('cmOrderNum'),fErr=g('cmFErr');
  var svc=g('cmSvc'),songList=g('cmSongList'),addBtn=g('cmAddSong');
  var sc=0;

  function mkSong(){
    sc++;var i=sc;
    var d=document.createElement('div');
    d.className='cm-song-entry';d.dataset.si=i;
    d.innerHTML=
      '<div class="cm-song-header">'+
        '<span class="cm-song-lbl">Song '+i+'</span>'+
        '<button type="button" class="cm-song-rm" data-rm="'+i+'">Remove</button>'+
      '</div>'+
      '<div class="cm-song-grid">'+
        '<div class="cm-field cm-song-full" id="csf-'+i+'-title">'+
          '<label>Song Title <span class="cm-required">*</span></label>'+
          '<input type="text" name="songs['+i+'][title]" placeholder="e.g. Lose Yourself"/>'+
          '<span class="cm-error">Please enter the song title.</span>'+
        '</div>'+
        '<div class="cm-field" id="csf-'+i+'-artist">'+
          '<label>Artist <span class="cm-required">*</span></label>'+
          '<input type="text" name="songs['+i+'][artist]" placeholder="e.g. Eminem"/>'+
          '<span class="cm-error">Please enter the artist.</span>'+
        '</div>'+
        '<div class="cm-field" id="csf-'+i+'-edit">'+
          '<label>Edit Type <span class="cm-required">*</span></label>'+
          '<select name="songs['+i+'][edit_type]">'+
            '<option value="" disabled selected>Select edit type</option>'+
            '<option value="Basic Cut">Basic Cut (single song)</option>'+
            '<option value="Multi-Song Edit">Multi-Song Edit (2-3 songs)</option>'+
            '<option value="Production Quote">Production Edit (4+ songs)</option>'+
          '</select>'+
          '<span class="cm-error">Please select an edit type.</span>'+
        '</div>'+
        '<div class="cm-field cm-song-full">'+
          '<label>Song Notes <span class="cm-opt">(optional)</span></label>'+
          '<input type="text" name="songs['+i+'][notes]" placeholder="Timestamps, cuts, energy notes"/>'+
        '</div>'+
      '</div>';
    return d;
  }

  function refreshLabels(){
    var es=songList.querySelectorAll('.cm-song-entry');
    es.forEach(function(e,i){e.querySelector('.cm-song-lbl').textContent='Song '+(i+1);});
    var rms=songList.querySelectorAll('.cm-song-rm');
    rms.forEach(function(b){b.disabled=(es.length<=1);});
  }

  function addSong(){songList.appendChild(mkSong());refreshLabels();}
  addSong();
  addBtn.addEventListener('click',addSong);

  songList.addEventListener('click',function(e){
    var b=e.target.closest('[data-rm]');
    if(!b||b.disabled)return;
    var entry=b.closest('.cm-song-entry');
    if(entry){entry.remove();refreshLabels();}
  });

  function vEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());}
  function setErr(id,on){var el=g(id);if(el)el.classList[on?'add':'remove']('has-error');}

  function valSongs(){
    var ok=true;
    songList.querySelectorAll('.cm-song-entry').forEach(function(entry){
      var i=entry.dataset.si;
      ['title','artist'].forEach(function(f){
        var inp=entry.querySelector('[name="songs['+i+']['+f+']"]');
        var fid='csf-'+i+'-'+f;
        if(!inp||!inp.value.trim()){setErr(fid,true);ok=false;}else setErr(fid,false);
      });
      var editInp=entry.querySelector('[name="songs['+i+'][edit_type]"]');
      var editFid='csf-'+i+'-edit';
      if(!editInp||!editInp.value){setErr(editFid,true);ok=false;}else setErr(editFid,false);
    });
    return ok;
  }

  function validate(){
    var ok=true;
    if(!g('cmName').value.trim()){setErr('cf-name',true);ok=false;}else setErr('cf-name',false);
    if(!vEmail(g('cmEmail').value)){setErr('cf-email',true);ok=false;}else setErr('cf-email',false);
    if(!svc.value){setErr('cf-svc',true);ok=false;}else setErr('cf-svc',false);
    if(!valSongs())ok=false;
    return ok;
  }

  function buildPayload(on){
    var p={order_number:on};
    new FormData(form).forEach(function(v,k){
      if(k!=='_hp'&&!k.startsWith('songs[')&&!k.startsWith('addon_'))p[k]=v;
    });
    // Collect add-ons
    var addons=[];
    ['addon_rush','addon_mashup','addon_fx'].forEach(function(name){
      var el=form.querySelector('[name="'+name+'"]');
      if(el&&el.checked)addons.push(el.value);
    });
    p.add_ons=addons;
    // Collect songs
    var songs=[];
    songList.querySelectorAll('.cm-song-entry').forEach(function(entry,idx){
      var i=entry.dataset.si,s={song_number:idx+1};
      ['title','artist','notes'].forEach(function(f){
        var inp=entry.querySelector('[name="songs['+i+']['+f+']"]');
        if(inp)s[f]=inp.value.trim();
      });
      var editInp=entry.querySelector('[name="songs['+i+'][edit_type]"]');
      if(editInp)s['edit_type']=editInp.value;
      songs.push(s);
    });
    p.songs=songs;p.num_songs=songs.length;
    return p;
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();fErr.classList.remove('visible');
    var hp=form.querySelector('[name="_hp"]');if(hp&&hp.value)return;
    if(!validate()){
      var first=form.querySelector('.has-error');
      if(first){first.scrollIntoView({behavior:'smooth',block:'center'});var inp=first.querySelector('input,select,textarea');if(inp)inp.focus();}
      return;
    }
    var on=gO();btn.disabled=true;btn.textContent='Submitting...';
    fetch('https://canyon-music-webhook.onrender.com/order',{
      method:'POST',body:JSON.stringify(buildPayload(on)),headers:{'Content-Type':'application/json'}
    })
    .then(function(r){
      if(r.ok){form.style.display='none';oNum.textContent=on;succ.classList.add('visible');succ.scrollIntoView({behavior:'smooth',block:'start'});}
      else throw new Error();
    })
    .catch(function(){btn.disabled=false;btn.textContent='Submit Order';fErr.classList.add('visible');fErr.scrollIntoView({behavior:'smooth',block:'center'});});
  });
})();
});
