var e=Object.defineProperty,t=Object.getOwnPropertySymbols,a=Object.prototype.hasOwnProperty,n=Object.prototype.propertyIsEnumerable,i=(t,a,n)=>a in t?e(t,a,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[a]=n,o=(e,o)=>{for(var c in o||(o={}))a.call(o,c)&&i(e,c,o[c]);if(t)for(var c of t(o))n.call(o,c)&&i(e,c,o[c]);return e};import{a as c,J as r,d as s,l,y as f,b as p,N as u}from"./vendor.58f6e198.js";const m={alert:c("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",width:"16",height:"16"},c("path",{"fill-rule":"evenodd",d:"M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM9 11a1 1 0 11-2 0 1 1 0 012 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"})),download:c("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",width:"16",height:"16"},c("path",{"fill-rule":"evenodd",d:"M7.47 10.78a.75.75 0 001.06 0l3.75-3.75a.75.75 0 00-1.06-1.06L8.75 8.44V1.75a.75.75 0 00-1.5 0v6.69L4.78 5.97a.75.75 0 00-1.06 1.06l3.75 3.75zM3.75 13a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5z"})),sync:c("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",width:"16",height:"16"},c("path",{"fill-rule":"evenodd",d:"M8 2.5a5.487 5.487 0 00-4.131 1.869l1.204 1.204A.25.25 0 014.896 6H1.25A.25.25 0 011 5.75V2.104a.25.25 0 01.427-.177l1.38 1.38A7.001 7.001 0 0114.95 7.16a.75.75 0 11-1.49.178A5.501 5.501 0 008 2.5zM1.705 8.005a.75.75 0 01.834.656 5.501 5.501 0 009.592 2.97l-1.204-1.204a.25.25 0 01.177-.427h3.646a.25.25 0 01.25.25v3.646a.25.25 0 01-.427.177l-1.38-1.38A7.001 7.001 0 011.05 8.84a.75.75 0 01.656-.834z"})),x:c("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",width:"16",height:"16"},c("path",{"fill-rule":"evenodd",d:"M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"}))};var d,g;(g=d||(d={})).all=function(e){return(t,a)=>{e.forEach((e=>e(t,a)))}},g.onFile=function(e,t){return(a,n)=>{for(const{name:o,data:c}of a.data[e]){const a={warn:e=>n.warn(`${o} ${e}`)};try{t(c,a)}catch(i){const t=new Error(`Error fixing ${e.replace(/^worldgen\//,"").replaceAll("_"," ")} ${o}: ${i.message}`);throw t.stack=i.stack,t}}}};const _=d.all([d.onFile("worldgen/configured_carver",h),d.onFile("worldgen/biome",(e=>{var t,a;"object"==typeof e.carvers&&(null==(t=e.carvers.air)||t.forEach(h),null==(a=e.carvers.liquid)||a.forEach(h))}))]);function h(e){if("object"!=typeof e)return;const t=e.type.replace(/^minecraft:/,"");e.config.lava_level={above_bottom:10},e.config.aquifers_enabled=!1,"cave"===t||"underwater_cave"===t||"nether_cave"===t?(e.config.y="nether_cave"===t?{type:"minecraft:uniform",min_inclusive:{absolute:0},max_inclusive:{below_top:1}}:{type:"minecraft:biased_to_bottom",min_inclusive:{absolute:0},max_inclusive:{absolute:127},inner:8},e.config.yScale=.5,e.config.horizontal_radius_multiplier=1,e.config.vertical_radius_multiplier=1,e.config.floor_level=-.7):(e.config.y={type:"minecraft:biased_to_bottom",min_inclusive:{absolute:20},max_inclusive:{absolute:67},inner:8},e.config.yScale=3,e.config.vertical_rotation={type:"minecraft:uniform",value:{min_inclusive:-.125,max_exclusive:.125}},e.config.shape={distance_factor:{type:"minecraft:uniform",value:{min_inclusive:.75,max_exclusive:1}},thickness:{type:"minecraft:trapezoid",value:{min:0,max:6,plateau:2}},width_smoothness:3,horizontal_radius_factor:{type:"minecraft:uniform",value:{min_inclusive:.75,max_exclusive:1}},vertical_radius_default_factor:1,vertical_radius_center_factor:0})}const b=d.all([d.onFile("dimension_type",y),d.onFile("dimension",(e=>{"object"==typeof e.type&&y(e.type)}))]);function y(e){e.min_y=0,e.height=256}const v=d.all([d.onFile("worldgen/configured_feature",w),d.onFile("worldgen/biome",(e=>{Array.isArray(e.starts)&&e.starts.forEach(w)}))]);function w(e,t){if("object"!=typeof e)return;switch(e.type.replace(/^minecraft:/,"")){case"basalt_columns":k(e.config,"reach"),k(e.config,"height");break;case"decorated":$(e.config.decorator),w(e.config.feature,t);break;case"delta_feature":k(e.config,"size"),k(e.config,"rim_size");break;case"disk":case"ice_patch":k(e.config,"radius");break;case"flower":case"no_bonemeal_flower":case"random_patch":const a=e.config.block_placer;"column_placer"===a.type.replace(/^minecraft:/,"")&&(a.size={type:"minecraft:uniform",value:{min_inclusive:a.min_size,max_inclusive:a.min_size+a.extra_size}},delete a.min_size,delete a.extra_size);break;case"netherrack_replace_blobs":const n=e.config.radius;let i="number"==typeof n?n:n.base,o="number"==typeof n?n:n.base+n.spread;if(o>12&&(t.warn(`Feature "netherrack_replace_blobs" radius ${o} is greater than 12 and could not be perfectly upgraded. Consider increasing the count of this feature.`),i=Math.min(12,i),o=Math.min(12,o)),i===o){e.config.radius=i;break}e.config.radius={type:"minecraft:uniform",value:{min_inclusive:i,max_inclusive:o}};break;case"no_surface_ore":x(e),e.type="minecraft:ore",e.config.discard_chance_on_air_exposure=1;break;case"ore":x(e);break;case"random_boolean_selector":w(e.config.feature_false,t),w(e.config.feature_true,t);break;case"random_selector":e.config.features.forEach((e=>w(e.feature,t))),w(e.config.default,t);break;case"sea_pickle":k(e.config,"count");break;case"simple_block":e.config.to_place={type:"minecraft:simple_state_provider",state:e.config.to_place};break;case"simple_random_selector":e.config.features.forEach((e=>w(e,t)));break;case"tree":["radius","offset","crown_height","height","trunk_height"].forEach((t=>k(e.config.foliage_placer,t))),e.config.foliage_provider=e.config.leaves_provider,delete e.config.leaves_provider,e.config.force_dirt=!1,e.config.dirt_provider={type:"minecraft:simple_state_provider",state:{Name:"minecraft:dirt"}},e.config.sapling_provider={type:"minecraft:simple_state_provider",state:{Name:E(e.config.foliage_provider),Properties:{stage:"0"}}},e.type="minecraft:decorated",e.config={decorator:{type:"decorated",config:z({type:"minecraft:water_depth_threshold",config:{max_water_depth:e.config.max_water_depth}},{type:"minecraft:heightmap",config:{heightmap:e.config.heightmap}})},feature:{type:"minecraft:tree",config:e.config}},delete e.config.feature.config.max_water_depth,delete e.config.feature.config.heightmap}}function k(e,t){"object"==typeof(null==e?void 0:e[t])&&(e[t]={type:"minecraft:uniform",value:{min_inclusive:e[t].base,max_inclusive:e[t].base+e[t].spread}})}function x(e){e.config.discard_chance_on_air_exposure=0,e.config.targets=[{target:e.config.target,state:e.config.state}],delete e.config.target,delete e.config.state}function E(e){if("simple_state_provider"===e.type.replace(/^minecraft:/,"")){const t=e.state.Name.match(/^(?:minecraft:)?([a-z_]+)_leaves/);if(t)return`minecraft:${t[1]}_sapling`}return"minecraft:oak_sapling"}function $(e,t){if("object"!=typeof e)return;switch(e.type.replace(/^minecraft:/,"")){case"carving_mask":if(0===e.config.probability){e.type="minecraft:nope",e.config={};break}const t=1/e.config.probability;e.type="minecraft:decorated",e.config=z({type:"minecraft:carving_mask",config:{step:e.config.step}},...Number.isInteger(t)?[{type:"minecraft:chance",config:{chance:t}}]:[{type:"minecraft:count_extra",config:{count:0,extra_count:1,extra_chance:e.config.probability}}]),delete e.config.probability;break;case"count":k(e.config,"count");break;case"decorated":$(e.config.outer),$(e.config.inner);break;case"heightmap_world_surface":e.type="minecraft:heightmap",e.config={heightmap:"WORLD_SURFACE_WG"};break;case"top_solid_heightmap":e.type="minecraft:heightmap",e.config={heightmap:"OCEAN_FLOOR_WG"};break;case"heightmap":case"heightmap_spread_double":e.config={heightmap:"MOTION_BLOCKING"};break;case"water_lake":e.type="minecraft:decorated",e.config=z({type:"minecraft:chance",config:{chance:e.config.chance}},{type:"minecraft:square",config:{}},{type:"minecraft:range",config:{height:{type:"minecraft:biased_to_bottom",min_inclusive:{absolute:0},max_inclusive:{absolute:256},inner:8}}});break;case"lava_lake":const a=e.config.chance/10;e.type="minecraft:decorated",e.config=z(...Number.isInteger(a)?[{type:"minecraft:chance",config:{chance:a}}]:[{type:"minecraft:count_extra",config:{count:0,extra_count:1,extra_chance:1/a}}],{type:"minecraft:square",config:{}},{type:"minecraft:range",config:{height:{type:"minecraft:biased_to_bottom",min_inclusive:{absolute:0},max_inclusive:{absolute:256},inner:8}}},{type:"minecraft:lava_lake",config:{chance:10}});break;case"fire":const n="number"==typeof e.config.count?e.config.count:e.config.count.base+e.config.count.spread/2;e.type="minecraft:decorated",e.config=z({type:"minecraft:count",config:{count:{type:"minecraft:biased_to_bottom",value:{min_inclusive:0,max_inclusive:Math.ceil(n/2)}}}},{type:"minecraft:square",config:{}},{type:"minecraft:range",config:{height:{type:"minecraft:uniform",min_inclusive:{absolute:4},max_inclusive:{absolute:252}}}});break;case"glowstone":const i="number"==typeof e.config.count?e.config.count:e.config.count.base+e.config.count.spread/2;e.type="minecraft:decorated",e.config=z({type:"minecraft:count",config:{count:{type:"minecraft:biased_to_bottom",value:{min_inclusive:0,max_inclusive:Math.ceil(i-1)}}}},{type:"minecraft:square",config:{}},{type:"minecraft:range",config:{height:{type:"minecraft:uniform",min_inclusive:{absolute:4},max_inclusive:{absolute:252}}}});break;case"range":const o=e.config.bottom_offset,c=e.config.bottom_offset+e.config.maximum-e.config.top_offset-1;if(o===c){e.config={height:{absolute:o}};break}e.config={height:{type:"minecraft:uniform",min_inclusive:{absolute:o},max_inclusive:{absolute:c}}};break;case"range_biased":const r=e.config.bottom_offset,s=e.config.bottom_offset+e.config.maximum-e.config.top_offset-1;e.type="minecraft:range",e.config={height:{type:"minecraft:biased_to_bottom",min_inclusive:{absolute:r},max_inclusive:{absolute:s},cutoff:r}};break;case"range_very_biased":const l=e.config.bottom_offset,f=e.config.bottom_offset+e.config.maximum-e.config.top_offset-1;e.type="minecraft:range",e.config={height:{type:"minecraft:very_biased_to_bottom",min_inclusive:{absolute:l},max_inclusive:{absolute:f},cutoff:l}};break;case"depth_average":e.type="minecraft:range",e.config={height:{type:"minecraft:trapezoid",min_inclusive:{absolute:e.config.baseline},max_inclusive:{absolute:e.config.baseline+e.config.spread}}}}}function z(...e){return{outer:e[0],inner:2===e.length?e[1]:{type:"minecraft:decorated",config:z(...e.slice(1))}}}const j=/^replaceitem (entity @.[^[]* .+ |entity @.\[.*\] .+ |block (.+ ){4})/,A=d.all([d.onFile("functions",(e=>{e.forEach(((t,a)=>{t.startsWith("replaceitem")&&(e[a]=t.replace(j,"item replace $1with "))}))}))]),O=d.all([d.onFile("worldgen/noise_settings",F),d.onFile("dimension",(e=>{var t,a;"noise"===(null==(a=null==(t=e.generator)?void 0:t.type)?void 0:a.replace(/^minecraft:/,""))&&F(e.generator.settings)}))]);function F(e){"object"==typeof e&&(e.bedrock_roof_position<=-10&&(e.bedrock_roof_position=-2147483648),e.bedrock_floor_position<=-10&&(e.bedrock_floor_position=-2147483648),e.min_surface_level=0,e.noise_caves_enabled=!1,e.noodle_caves_enabled=!1,e.aquifers_enabled=!1,e.deepslate_enabled=!1,e.ore_veins_enabled=!1,e.noise.min_y=0)}function L(e){var t,a;"object"==typeof e.conditions&&(P(e.conditions.entity),P(e.conditions.player),P(e.conditions.parent),P(e.conditions.partner),P(e.conditions.child),P(e.conditions.villager),P(e.conditions.zombie),P(e.conditions.projectile),P(e.conditions.shooter),null==(t=e.conditions.victims)||t.forEach(P),q(e.conditions.item),null==(a=e.conditions.items)||a.forEach(q),N(e.conditions.damage),N(e.conditions.killing_blow),R(e.conditions.location),R(e.conditions.entered),R(e.conditions.exited))}function C(e){var t,a;null==(t=e.entries)||t.forEach(M),null==(a=e.conditions)||a.forEach(D)}function M(e){var t,a;null==(t=e.children)||t.forEach(M),null==(a=e.conditions)||a.forEach(D)}function D(e){switch(e.condition.replace(/^minecraft:/,"")){case"match_tool":q(e.predicate);break;case"entity_properties":P(e.predicate);break;case"damage_source_properties":N(e.predicate);break;case"location_check":R(e.predicate)}}function N(e){"object"==typeof e&&(P(e.source_entity),P(e.direct_entity),N(e.type))}function P(e){"object"==typeof e&&(Array.isArray(e)?e.forEach(D):(e.equipment&&Object.values(e.equipment).forEach(q),P(e.vehicle),P(e.targeted_entity),R(e.location)))}function R(e){"object"==typeof e&&function(e){if("object"!=typeof e)return;e.block&&(e.blocks=[e.block],delete e.block)}(e.block)}function q(e){"object"==typeof e&&e.item&&(e.items=[e.item],delete e.item)}function T(e){if("object"!=typeof e)return;"nether_fossil"===e.type.replace(/^minecraft:/,"")&&(e.config||(e.config={}),e.config.height={type:"minecraft:uniform",min_inclusive:{absolute:32},max_inclusive:{below_top:2}})}const S=[d.all([d.onFile("predicates",(e=>{Array.isArray(e)?e.forEach(D):D(e)})),d.onFile("advancements",(e=>{Object.values(e.criteria).forEach(L)})),d.onFile("loot_tables",(e=>{var t;null==(t=e.pools)||t.forEach(C)}))]),A,b,O,d.all([d.onFile("worldgen/configured_structure_feature",T),d.onFile("worldgen/biome",(e=>{Array.isArray(e.starts)&&e.starts.forEach(T)}))]),_,v,e=>{e.meta.data.pack.pack_format=7}],I=["advancements","dimension","dimension_type","loot_tables","predicates","worldgen/biome","worldgen/configured_carver","worldgen/configured_feature","worldgen/configured_structure_feature","worldgen/configured_surface_builder","worldgen/noise_settings","worldgen/processor_list","worldgen/template_pool"];var B;function H({pack:e,onError:t}){const[a,n]=l(null),[i,o]=l([]),[r,s]=l(null),[p,u]=l(!1),d=e.name.replace(/\.zip$/,"_1_17.zip");f((()=>{(async()=>{try{const{warnings:t}=await B.upgrade(e);t&&o(t);const a=await B.toZip(e);n(a)}catch(a){t(a),s("Error during upgrading")}})()}),[e]);return c("div",{class:"pack"},c("div",{class:"pack-head"},a&&c("a",{class:"pack-status download",href:a,download:d,"data-hover":"Download data pack for 1.17"},m.download),!a&&!r&&c("div",{class:"pack-status loading"},m.sync),(a&&i.length>0||r)&&c("div",{class:"pack-status alert"+(r?" error":""),onClick:()=>{u(!p)},"data-hover":null!=r?r:"There were issues upgrading"},m.alert),c("span",{class:"pack-name"},e.name.replace(/\.zip$/,""))),a&&i&&!p&&c("div",{class:"pack-body"},i.map((e=>c("div",{class:"pack-alert"},e)))))}function U(){const[e,t]=l([]),[a,n]=l([]),i=e=>{console.error(e),n([...a,{process:"upgrading",error:e}])};return c("main",{onDrop:async i=>{if(i.preventDefault(),!i.dataTransfer)return;const o=[];for(let e=0;e<i.dataTransfer.files.length;e++){const t=i.dataTransfer.files[e];t.type.match(/^application\/(x-)?zip(-compressed)?$/)&&o.push(B.fromZip(t))}if(o.length>0){const i=await Promise.all(o.map((async e=>{try{return await e}catch(t){return n([...a,{process:"loading",error:t}]),void console.error(t)}})));t([...e,...i.filter((e=>void 0!==e))])}},onDragOver:e=>e.preventDefault()},0===e.length?c(p,null,c("div",{class:"drop"},c("h1",null,"Drop data pack here"),c("p",null,"Converts from 1.16.5 to 1.17"))):c(p,null,c("div",{class:"packs"},e.map((e=>c(H,{pack:e,onError:i})))),c("div",{class:"footer"},c("p",null,"Developed by Misode"),c("p",null,"Source code on ",c("a",{href:"https://github.com/misode/upgrader",target:"_blank"},"GitHub")))),c("div",{class:"main-errors"},a.map((e=>{const t=`${e.error.name}: ${e.error.message}`,i=`An error occurred while ${e.process} a data pack.\nData Pack: \x3c!-- ATTACH YOUR DATAPACK HERE --\x3e\n\n\`\`\`\n${e.error.stack}\n\`\`\`\n`,o=`https://github.com/misode/upgrader/issues/new?title=${encodeURIComponent(t)}&body=${encodeURIComponent(i)}\n`;return c("div",{class:"main-error"},c("p",null,"Something went wrong ",e.process," the data pack:"),c("p",{class:"error-message"},e.error.message),c("p",null,"You can report this as a bug ",c("a",{href:o,target:"_blank"},"on GitHub")," and upload the data pack"),c("div",{class:"error-close",onClick:()=>n(a.filter((t=>t.error.message!==e.error.message||t.process!==e.process)))},m.x))}))))}!function(e){async function t(e,t){let n=await a(e,t);const i=s(n).indent;try{return n=n.split("\n").map((e=>e.replace(/^([^"\/]+)\/\/.*/,"$1"))).join("\n"),{data:JSON.parse(n),indent:i}}catch(o){throw new Error(`Cannot parse "${t}": ${o.message}.`)}}async function a(e,t){const a=e.files[t];if(!a)throw new Error(`Cannot find "${t}".`);return await a.async("text")}function n(e,t,a,n){i(e,t,JSON.stringify(a,null,n)+"\n")}function i(e,t,a){e.file(t,a)}e.fromZip=async function(e){const n=await e.arrayBuffer(),i=await r.loadAsync(n),c={name:e.name,zip:i,data:{}};return await Promise.all(I.map((async e=>{c.data[e]=await async function(e,a){const n=new RegExp(`^data/([^/]+)/${a}/(.*).json$`);return Promise.all(Object.keys(e.files).map((e=>e.match(n))).filter((e=>e)).map((async a=>o({name:`${a[1]}:${a[2]}`},await t(e,a[0])))))}(i,e)}))),c.data.functions=await async function(e){const t=/^data\/([^\/]+)\/functions\/(.*)\.mcfunction$/;return Promise.all(Object.keys(e.files).map((e=>e.match(t))).filter((e=>e)).map((async t=>({name:`${t[1]}:${t[2]}`,data:(await a(e,t[0])).split("\n")}))))}(i),c.meta=o({name:"pack"},await t(i,"pack.mcmeta")),console.log(c),c},e.toZip=async function(e){var t;I.forEach((t=>{!function(e,t,a){a.forEach((({name:a,data:i,indent:o})=>{const[c,r]=a.split(":");n(e,`data/${c}/${t}/${r}.json`,i,o)}))}(e.zip,t,e.data[t])})),t=e.zip,e.data.functions.forEach((({name:e,data:a})=>{const[n,o]=e.split(":");i(t,`data/${n}/functions/${o}.mcfunction`,a.join("\n"))})),n(e.zip,"pack.mcmeta",e.meta.data,e.meta.indent);const a=await e.zip.generateAsync({type:"blob"});return URL.createObjectURL(a)},e.upgrade=async function(e){if(7===e.meta.data.pack.pack_format)return{warnings:["This pack already has pack_format 7 and cannot be upgraded."]};const t=[],a={warn:e=>t.push(e)};for(const n of S)n(e,a);return{warnings:t}}}(B||(B={}));u(c(U,null),document.body);
