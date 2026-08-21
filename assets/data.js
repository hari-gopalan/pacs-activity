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

/* Per-category explanation, templated with the feature's name. Shown as a
   hover tooltip on each category pill (student.html) instead of a static
   legend, so the explanation is specific to the feature being classified. */
const CATEGORY_EXPLAIN = {
 "Attractive": f => `${f} is a pleasant surprise when it's present — nobody misses it if it's absent.`,
 "Performance": f => `Satisfaction with ${f} rises the better it's executed, and falls the worse it's done.`,
 "Must-Be": f => `It is expected that ${f} is in the PACS software by default, and its absence causes real frustration.`,
 "Indifferent": f => `Users notice little change either way if ${f} is well done or poorly done.`
};

const CRITERIA = [
 {key:'kano', name:'Application of the Kano Model', levels:{4:'Features are placed appropriately, with at least half of the placements being reasonable and demonstrating an understanding of the importance of each PACS feature to the end user.', 1:'Placement demonstrates poor understanding of PACS features and how they relate to the end user.'}},
 {key:'justification', name:'Overall Justification', levels:{4:'Decisions throughout the activity are logical, consistent, and supported by user needs or workflow considerations.', 3:'Most decisions are explained with reasonable logic.', 2:'Some explanations are unclear or unsupported.', 1:'Little or no justification is provided.'}}
];

/* ---- Kano graph geometry (used by student.html's own graph and
   instructor.html's comparator) ----

   The four reference curves are textbook-correct Kano shapes, and two pairs
   of them genuinely converge near the neutral line at their extremes: an
   Attractive feature done poorly reads the same as Indifferent (absence
   isn't missed), and a Must-Be feature done well reads the same as
   Indifferent (it just meets the baseline, no delight). That convergence is
   real Kano theory, not a rendering bug -- but it makes a marker sitting
   exactly on a curve genuinely ambiguous about which curve it belongs to.

   Fix: markers are placed at a small fixed vertical offset from their
   category's curve ("lane offset" below) rather than exactly on it, chosen
   per category so the four lanes stay visually separated even where the
   curves themselves nearly touch. A thin leader line is drawn from the
   marker back to its exact point on the curve (curveAnchor below), so which
   curve a marker belongs to is never ambiguous even after it's been pushed
   aside by collision resolution. Execution quality still drives position
   along the curve (as before) and additionally drives marker *radius*
   (bigger = better executed) as a second, position-independent cue. */
function tint(hex,idx){
 const a=[0,.16,.30,.42,.52,.62][Math.min(idx,5)],n=hex.slice(1),r=parseInt(n.slice(0,2),16),g=parseInt(n.slice(2,4),16),b=parseInt(n.slice(4,6),16);
 const m=c=>Math.round(c+(255-c)*a); return `rgb(${m(r)},${m(g)},${m(b)})`;
}
function tintAlpha(idx){ return [0,.16,.30,.42,.52,.62][Math.min(idx,5)]; }
function bez(p0,p1,p2,p3,t){let u=1-t;return{x:u*u*u*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*p3.x,y:u*u*u*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*p3.y}}

// Fixed vertical nudge per category, away from the neutral line: Attractive
// lifts toward delight, Must-Be drops toward the dissatisfaction risk it
// represents, Performance nudges down slightly so it doesn't crowd
// Attractive at the well-done/top-right end, Indifferent stays put as the
// neutral reference everything else is read against.
const CATEGORY_LANE_OFFSET = {"Attractive":-15,"Performance":8,"Must-Be":17,"Indifferent":0};

// Execution quality's second, position-independent encoding: a better-
// executed feature gets a visibly bigger marker, on top of sitting further
// along its curve. Ground-truth/instructor markers add a flat bonus on top
// of this (see callers), so the two cues don't fight each other.
const EXEC_RADIUS = {"Poorly done":6.5,"Adequate":8.5,"Well done":10.5};

function curveAnchor(cat, t){
 if(cat==="Performance") return {x:175+(770-175)*t, y:560+(140-560)*t};
 if(cat==="Indifferent") return {x:150+(782-150)*t, y:352};
 if(cat==="Attractive") return bez({x:150,y:345},{x:340,y:344},{x:610,y:300},{x:782,y:118}, t);
 return bez({x:195,y:585},{x:300,y:430},{x:415,y:362},{x:782,y:350}, t); // Must-Be
}

// Returns {x,y} -- where the marker should be drawn (curve point + lane
// offset, before collision resolution) -- plus {anchorX,anchorY}, the exact
// point on the reference curve, for the leader line. `pi` no longer nudges
// position (collision resolution below handles all separation, including
// between multiple people's markers in the instructor comparator); it's
// kept as a parameter for call-site compatibility and only breaks an exact
// numerical tie between coincident points before the collision resolver runs.
function point(cat,fi,pi,execLevel){
 let t = (execLevel && EXEC_T[execLevel]!==undefined) ? EXEC_T[execLevel] : (.08+fi*(0.84/(FEATURES.length-1)));
 t = Math.max(0, Math.min(1, t + (pi||0)*0.0005));
 const anchor = curveAnchor(cat, t);
 const y = anchor.y + (CATEGORY_LANE_OFFSET[cat]||0);
 return {x:anchor.x, y, anchorX:anchor.x, anchorY:anchor.y};
}

// Automatic collision avoidance: pairwise repulsion, iterated to a stable
// layout. `yDamp` (0-1) biases spreading to be mostly horizontal -- i.e.
// along the execution axis, within a marker's own category lane -- rather
// than vertical, which could otherwise push a marker toward a neighboring
// category's lane. No manual per-marker offsets; every position markers end
// up at beyond their lane placement comes from this algorithm alone.
function resolveCollisions(items,gap,yDamp){
 yDamp = yDamp==null ? 1 : yDamp;
 for(let iter=0;iter<80;iter++){
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
         a.x-=ux*push; a.y-=uy*push*yDamp;
         b.x+=ux*push; b.y+=uy*push*yDamp;
       }
     }
   }
   if(!moved) break;
 }
 items.forEach(it=>{it.x=Math.max(140,Math.min(805,it.x));it.y=Math.max(105,Math.min(600,it.y));});
 return items;
}
