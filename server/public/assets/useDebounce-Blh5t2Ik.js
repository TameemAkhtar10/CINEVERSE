import{r as o}from"./index-Dvz25M1W.js";function n(e,t=500){const[r,s]=o.useState(e);return o.useEffect(()=>{const u=setTimeout(()=>s(e),t);return()=>clearTimeout(u)},[e,t]),r}export{n as u};
