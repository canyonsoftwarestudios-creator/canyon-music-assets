document.addEventListener('DOMContentLoaded',function(){
(function(){
  function gO(){var t=Date.now().toString(36).toUpperCase().slice(-5),r=Math.random().toString(36).toUpperCase().slice(2,5);return'CM-'+t+r;}
  function g(id){return document.getElementById(id);}
  var form=g('cmForm'),btn=g('cmBtn'),succ=g('cmSuccess'),oNum=g('cmOrderNum'),fErr=g('cmFErr');
  var svc=g('cmSvc'),stWrap=g('cf-studio'),stIn=g('cmStudio'),songList=g('cmSongList'),addBtn=g('cmAddSong');
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
          '<label>Song Title <span class="cm-req">*</span></label>'+
          '<input type="text" name="songs['+i+'][title]" placeholder="e.g. Lose Yourself"/>'+
          '<span class="cm-err">Please enter the song title.</span>'+
        '</div>'+
        '<div class="cm-field" id="csf-'+i+'-artist">'+
          '<label>Artist <span class="cm-req">*</span></label>'+
          '<input type="text" name="songs['+i+'][artist]" placeholder="e.g. Eminem"/>'+
          '<span class="cm-err">Please enter the artist.</span>'+
        '</div>'+
        '<div class="cm-field" id="csf-'+i+'-edit">'+
          '<label>Edit Type <span class="cm-req">*</span></label>'+
          '<select name="songs['+i+'][edit_type]">'+
            '<option value="" disabled selected>Select edit type</option>'+
            '<option value="Basic Cut">Basic Cut (single song)</option>'+
            '<option value="Multi-Song Edit">Multi-Song Edit (2-3 songs)</option>'+
            '<option value="Production Quote">Production Edit (4+ songs)</option>'+
          '</select>'+
          '<span class="cm-err">Please select an edit type.</span>'+
        '</div>'+
        '<div class="cm-field" id="csf-'+i+'-style">'+
          '<label>Dance Style <span class="cm-req">*</span></label>'+
          '<input type="text" name="songs['+i+'][style]" placeholder="e.g. Contemporary, Hip Hop"/>'+
          '<span class="cm-err">Please enter the dance style.</span>'+
        '</div>'+
        '<div class="cm-field" id="csf-'+i+'-level">'+
          '<label>Level <span class="cm-req">*</span></label>'+
          '<select name="songs['+i+'][level]">'+
            '<option value="" disabled selected>Select level</option>'+
            '<option>Mini</option><option>Youth</option><option>Junior</option>'+
            '<option>Teen</option><option>Senior</option><option>Adult</option>'+
          '</select>'+
          '<span class="cm-err">Please select a level.</span>'+
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

  svc.addEventListener('change',function(){
    stWrap.classList[svc.value==='Studio Bundle'?'add':'remove']('visible');
  });

  function vEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());}
  function setErr(id,on){var el=g(id);if(el)el.classList[on?'add':'remove']('has-error');}

  function valSongs(){
    var ok=true;
    songList.querySelectorAll('.cm-song-entry').forEach(function(entry){
      var i=entry.dataset.si;
      ['title','artist','style'].forEach(function(f){
        var inp=entry.querySelector('[name="songs['+i+']['+f+']"]');
        var fid='csf-'+i+'-'+f;
        if(!inp||!inp.value.trim()){setErr(fid,true);ok=false;}else setErr(fid,false);
      });
      ['edit_type','level'].forEach(function(f){
        var k=f==='edit_type'?'edit':'level';
        var inp=entry.querySelector('[name="songs['+i+']['+f+']"]');
        var fid='csf-'+i+'-'+k;
        if(!inp||!inp.value){setErr(fid,true);ok=false;}else setErr(fid,false);
      });
    });
    return ok;
  }

  function validate(){
    var ok=true;
    if(!g('cmName').value.trim()){setErr('cf-name',true);ok=false;}else setErr('cf-name',false);
    if(!vEmail(g('cmEmail').value)){setErr('cf-email',true);ok=false;}else setErr('cf-email',false);
    if(!svc.value){setErr('cf-svc',true);ok=false;}else setErr('cf-svc',false);
    if(stWrap.classList.contains('visible')&&!stIn.value.trim()){setErr('cf-studio',true);ok=false;}else setErr('cf-studio',false);
    if(!valSongs())ok=false;
    return ok;
  }

  function buildPayload(on){
    var p={order_number:on};
    new FormData(form).forEach(function(v,k){
      if(k!=='_hp'&&!k.startsWith('songs['))p[k]=v;
    });
    var songs=[];
    songList.querySelectorAll('.cm-song-entry').forEach(function(entry,idx){
      var i=entry.dataset.si,s={song_number:idx+1};
      ['title','artist','style','notes'].forEach(function(f){
        var inp=entry.querySelector('[name="songs['+i+']['+f+']"]');
        if(inp)s[f]=inp.value.trim();
      });
      ['edit_type','level'].forEach(function(f){
        var inp=entry.querySelector('[name="songs['+i+']['+f+']"]');
        if(inp)s[f]=inp.value;
      });
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