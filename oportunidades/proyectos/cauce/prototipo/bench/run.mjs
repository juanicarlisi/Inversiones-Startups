try { await import('./exp.mjs'); } catch(e){ console.log('ERR:', String(e.message).slice(0,300)); }
process.on('uncaughtException', e=>console.log('UNC', String(e.message).slice(0,300)));
