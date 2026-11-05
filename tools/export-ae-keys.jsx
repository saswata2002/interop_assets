(function(){
var OUT = "/Users/sdutta/Documents/My Works Sas/untitled folder/Interop Assets/tools/ae-dump.json";
var LOG = new File(OUT); LOG.encoding="UTF-8"; LOG.open("w"); LOG.close();
function w(s){ LOG.open("a"); LOG.write(s); LOG.close(); }
function q(s){ return '"' + String(s).replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r/g,"\\n").replace(/\n/g,"\\n") + '"'; }
function n(v){ if (typeof v === "number") return isFinite(v)? String(Math.round(v*1e6)/1e6) : "null"; if (typeof v==="boolean") return v?"true":"false"; var o="["; for (var i=0;i<v.length;i++){ o += (i?",":"") + n(v[i]);} return o+"]"; }
function ease(arr){ var o="["; for (var i=0;i<arr.length;i++){ o += (i?",":"")+"["+n(arr[i].speed)+","+n(arr[i].influence)+"]"; } return o+"]"; }
function itp(t){ return t===KeyframeInterpolationType.LINEAR?'"L"':(t===KeyframeInterpolationType.HOLD?'"H"':'"B"'); }
function prop(p){
  var s = "{";
  var isPath = (p.propertyValueType === PropertyValueType.SHAPE);
  if (isPath) return '{"path":true}';
  try { s += '"v":' + n(p.valueAtTime(0,true)); } catch(e){ s += '"v":null'; }
  if (p.numKeys>0){
    s += ',"k":[';
    for (var k=1;k<=p.numKeys;k++){
      s += (k>1?",":"") + "{" + '"t":'+n(p.keyTime(k)) + ',"v":'+n(p.keyValue(k)) + ',"ii":'+itp(p.keyInInterpolationType(k))+',"oi":'+itp(p.keyOutInterpolationType(k));
      if (p.keyInInterpolationType(k)===KeyframeInterpolationType.BEZIER || p.keyOutInterpolationType(k)===KeyframeInterpolationType.BEZIER){
        s += ',"ie":'+ease(p.keyInTemporalEase(k))+',"oe":'+ease(p.keyOutTemporalEase(k));
      }
      if (p.isSpatial){ try { s += ',"ist":'+n(p.keyInSpatialTangent(k))+',"ost":'+n(p.keyOutSpatialTangent(k)); } catch(e){} }
      s += "}";
    }
    s += "]";
  }
  if (p.canSetExpression && p.expression) s += ',"expr":'+q(p.expression) + ',"exprOn":'+(p.expressionEnabled?"true":"false");
  return s + "}";
}
function group(g, depth){
  var s = "{" + '"mn":'+q(g.matchName)+',"name":'+q(g.name);
  try { if (g.enabled === false) s += ',"off":true'; } catch(e){}
  s += ',"c":[';
  var first = true;
  for (var i=1;i<=g.numProperties;i++){
    var p = g.property(i);
    var str;
    if (p.propertyType === PropertyType.PROPERTY){
      if (p.matchName==="ADBE Text Document") continue;
      var interesting = p.numKeys>0 || (p.canSetExpression && p.expression) || depth>0;
      if (!interesting) continue;
      try { str = '{"mn":'+q(p.matchName)+',"name":'+q(p.name)+',"p":'+prop(p)+"}"; } catch(e){ str = '{"mn":'+q(p.matchName)+',"err":'+q(e.toString())+'}'; }
    } else {
      if (depth===0 && (p.matchName==="ADBE Transform Group"||p.matchName==="ADBE Effect Parade"||p.matchName==="ADBE Mask Parade"||p.matchName==="ADBE Layer Styles"||p.matchName==="ADBE Material Options Group"||p.matchName==="ADBE Plane Options Group"||p.matchName==="ADBE Extrsn Options Group"||p.matchName==="ADBE Audio Group"||p.matchName==="ADBE Data Group")) continue;
      str = group(p, depth+1);
    }
    s += (first?"":",") + str; first=false;
  }
  return s + "]}";
}
function tr(L){
  var T = L.property("ADBE Transform Group");
  var s = "{";
  var names = ["ADBE Anchor Point","ADBE Position","ADBE Position_0","ADBE Position_1","ADBE Scale","ADBE Rotate Z","ADBE Opacity"];
  var sep = T.property("ADBE Position").dimensionsSeparated;
  s += '"sep":'+(sep?"true":"false");
  for (var i=0;i<names.length;i++){
    if (sep && names[i]==="ADBE Position") continue;
    if (!sep && (names[i]==="ADBE Position_0"||names[i]==="ADBE Position_1")) continue;
    w(""); // flush point
    s += ',"'+names[i].replace("ADBE ","")+'":'+prop(T.property(names[i]));
  }
  return s+"}";
}
var comps = {};
for (var i=1;i<=app.project.numItems;i++){ var it=app.project.item(i); if (it instanceof CompItem) comps[it.name]=it; }
var list = ["03- Exit","Switching to (precomp)","MINUTES lockup (precomp)","Crate plate (precomp)"];
w("{");
for (var c=0;c<list.length;c++){
  var C = comps[list[c]];
  w((c?",":"")+q(list[c])+':{"w":'+C.width+',"h":'+C.height+',"dur":'+n(C.duration)+',"fps":'+C.frameRate+',"layers":[');
  for (var i=1;i<=C.numLayers;i++){
    var L = C.layer(i);
    var s = (i>1?",":"")+'{"i":'+i+',"name":'+q(L.name)+',"mn":'+q(L.matchName)+',"en":'+(L.enabled?"true":"false")+',"st":'+n(L.startTime)+',"in":'+n(L.inPoint)+',"out":'+n(L.outPoint);
    if (L.parent) s += ',"parent":'+L.parent.index;
    try { s += ',"blend":'+L.blendingMode; } catch(e){}
    try { if (L.trackMatteType!==TrackMatteType.NO_TRACK_MATTE){ s += ',"matte":'+L.trackMatteType+',"matteL":'+(L.trackMatteLayer?L.trackMatteLayer.index:-1); } } catch(e){}
    try { if (L.source){ s += ',"src":'+q(L.source.name)+',"sw":'+L.source.width+',"sh":'+L.source.height; if (L.source.mainSource && L.source.mainSource.file) s += ',"file":'+q(L.source.mainSource.file.fsName); if (L.source.mainSource && L.source.mainSource.color) s += ',"color":'+n(L.source.mainSource.color); } } catch(e){}
    w(s);
    w(',"tr":'+tr(L));
    if (L.matchName==="ADBE Vector Layer" || L.matchName==="ADBE Text Layer"){
      var r = L.sourceRectAtTime(0,false);
      w(',"rect":'+n([r.left,r.top,r.width,r.height]));
    }
    if (L.matchName==="ADBE Text Layer"){
      var td = L.property("ADBE Text Properties").property("ADBE Text Document").value;
      w(',"text":{"t":'+q(td.text)+',"font":'+q(td.font)+',"size":'+n(td.fontSize)+',"track":'+n(td.tracking)+',"just":'+td.justification+',"fill":'+n(td.fillColor)+',"lead":'+n(td.leading)+',"fauxB":'+(td.fauxBold?"true":"false")+'}');
      w(',"tp":'+group(L.property("ADBE Text Properties"),1));
    }
    if (L.matchName==="ADBE Vector Layer"){
      w(',"shape":'+group(L.property("ADBE Root Vectors Group"),1));
    }
    w(',"fx":'+L.property("ADBE Effect Parade").numProperties+',"masks":'+L.property("ADBE Mask Parade").numProperties);
    w("}");
  }
  w("]}");
}
w("}");
})();
