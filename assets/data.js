/* PACS Kano — shared data & geometry
   Used by student.html and instructor.html. Keep feature order stable —
   indices are used as IDs throughout (responses, answer key, grading). */

const FEATURES = ["Image storage","Voice dictation/report integration","DICOM compatibility","Multi-monitor support","Secure user login","Automatic prefetching of prior studies","Fast image loading","Patient identification matching","Side-by-side comparison of current and prior examinations","Backup and disaster recovery","Customizable user interface and workspace layout","System uptime and reliability","Hanging protocols","Audit trail","Mobile PACS viewing","Measurement and annotation tools","Image integrity (protection against data loss or corruption)","RIS integration","Window/level adjustment tools","Image retrieval"];

const DESCRIPTIONS = [
"Where and how completed studies are archived for long term access.",
"Lets a radiologist dictate findings directly into the report.",
"Ability to read and exchange standard DICOM files across scanners and viewers.",
"Displays a study across multiple screens at once.",
"Authentication that limits system access to authorized staff.",
"Pulls a patient's relevant prior exams into the viewer in advance.",
"Time from opening a study to having it fully rendered on screen.",
"Confirms a study is linked to the correct patient record before it is opened.",
"Shows the current and a prior study together for direct comparison.",
"Safeguards that restore images and access after a system failure.",
"Lets a user rearrange tools and panels to fit their own workflow.",
"How consistently the system stays available during clinical hours.",
"Automatic rules that arrange a study's images in a preferred viewing order.",
"A record of who viewed or changed a study, and when.",
"Access to studies from a phone or tablet outside the reading room.",
"Tools for marking, measuring, and labeling findings on an image.",
"Confirms an image has not been altered or degraded since it was acquired.",
"Connection to the Radiology Information System for orders and reports.",
"Controls for adjusting image brightness and contrast during review.",
"How reliably a stored study can be located and pulled up on demand."
];

const CATEGORIES = ["Attractive","Performance","Must-Be","Indifferent"];
const EXEC_LEVELS = ["Poorly done","Adequate","Well done"];
const COLORS = {"Attractive":"#1d78c9","Performance":"#b8790f","Must-Be":"#c22b6d","Indifferent":"#71808f"};
const EXEC_T = {"Poorly done":.12,"Adequate":.5,"Well done":.88};

const CRITERIA = [
 {key:'kano', name:'Application of the Kano Model', levels:{4:'Features are placed appropriately, with at least half of the placements being reasonable and demonstrating an understanding of the importance of each PACS feature to the end user.', 1:'Placement demonstrates poor understanding of PACS features and how they relate to the end user.'}},
 {key:'creativity', name:'Creativity of New Features', levels:{4:'Three creative, appropriate, and relevant PACS features are proposed that demonstrate thoughtful consideration of future user needs.', 3:'Three relevant features are proposed with some creativity.', 2:'Features are somewhat relevant but lack originality or value to the user.', 1:'Features are inappropriate, incomplete, or missing.'}},
 {key:'pitch', name:'CTO Investment Pitch', levels:{4:'The proposed feature is presented as a compelling, "no-brainer" investment with a clear value proposition and strong justification.', 3:'The feature is supported with a reasonable justification for investment.', 2:'The justification is present but weak or only partially convincing.', 1:'The feature is poorly justified and would not be a convincing investment.'}},
 {key:'justification', name:'Overall Justification', levels:{4:'Decisions throughout the activity are logical, consistent, and supported by user needs or workflow considerations.', 3:'Most decisions are explained with reasonable logic.', 2:'Some explanations are unclear or unsupported.', 1:'Little or no justification is provided.'}}
];

/* ---- Kano graph geometry (used by instructor.html comparator) ---- */
function tint(hex,idx){
 const a=[0,.16,.30,.42,.52,.62][Math.min(idx,5)],n=hex.slice(1),r=parseInt(n.slice(0,2),16),g=parseInt(n.slice(2,4),16),b=parseInt(n.slice(4,6),16);
 const m=c=>Math.round(c+(255-c)*a); return `rgb(${m(r)},${m(g)},${m(b)})`;
}
function tintAlpha(idx){ return [0,.16,.30,.42,.52,.62][Math.min(idx,5)]; }
function bez(p0,p1,p2,p3,t){let u=1-t;return{x:u*u*u*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*p3.x,y:u*u*u*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*p3.y}}
function point(cat,fi,pi,execLevel){
 let t = (execLevel && EXEC_T[execLevel]!==undefined) ? EXEC_T[execLevel] : (.08+fi*(0.84/(FEATURES.length-1)));
 t+=(-2.5+pi)*.007;
 let p;
 if(cat==="Performance")p={x:175+(770-175)*t,y:560+(140-560)*t};
 else if(cat==="Indifferent")p={x:150+(782-150)*t,y:352};
 else if(cat==="Attractive")p=bez({x:150,y:345},{x:340,y:344},{x:610,y:300},{x:782,y:118},t);
 else p=bez({x:195,y:585},{x:300,y:430},{x:415,y:362},{x:782,y:350},t);
 const off=[-13,-7.5,-2.5,2.5,7.5,13][pi]||0; p.y+=off;
 return p;
}
function resolveCollisions(items,gap){
 for(let iter=0;iter<60;iter++){
   let moved=false;
   for(let i=0;i<items.length;i++){
     for(let j=i+1;j<items.length;j++){
       const a=items[i], b=items[j];
       let dx=b.x-a.x, dy=b.y-a.y, dist=Math.hypot(dx,dy);
       const minDist=a.r+b.r+gap;
       if(dist<minDist){
         moved=true;
         if(dist<0.01){dx=(i%2?1:-1);dy=(j%2?1:-1);dist=Math.hypot(dx,dy);}
         const push=(minDist-dist)/2, ux=dx/dist, uy=dy/dist;
         a.x-=ux*push; a.y-=uy*push; b.x+=ux*push; b.y+=uy*push;
       }
     }
   }
   if(!moved) break;
 }
 items.forEach(it=>{it.x=Math.max(140,Math.min(805,it.x));it.y=Math.max(105,Math.min(600,it.y));});
 return items;
}
