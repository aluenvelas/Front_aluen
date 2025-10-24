# 🚀 Configuración de Netlify para ALUEN

## Variables de Entorno Requeridas

Para que la aplicación funcione correctamente en Netlify, necesitas configurar la siguiente variable de entorno:

### Variable de Entorno:
```
REACT_APP_API_URL = https://back-aluen-ohbk.onrender.com/api
```

## 📋 Pasos para Configurar:

1. **Accede a tu Dashboard de Netlify:**
   - Ve a: https://app.netlify.com
   - Selecciona tu sitio: **aluenvelas**

2. **Navega a Environment Variables:**
   - Clic en: **Site settings** (⚙️)
   - En el menú lateral: **Environment variables**
   - Botón: **Add a variable**

3. **Agrega la Variable:**
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://back-aluen-ohbk.onrender.com/api`
   - Clic en: **Save**

4. **Redeploy el Sitio:**
   - Ve a: **Deploys**
   - Clic en: **Trigger deploy** → **Clear cache and deploy site**

## ⏱️ Tiempo de Espera

El deploy tomará aproximadamente **2-3 minutos**. Una vez completado, la aplicación funcionará correctamente.

## ✅ Verificación

Para verificar que todo funciona:
1. Abre: https://aluenvelas.netlify.app
2. Presiona: **Ctrl + Shift + R** (recarga sin cache)
3. No deberías ver errores de CORS en la consola
4. La aplicación debería cargar los datos correctamente

## 🔧 Archivo de Configuración

Este repositorio incluye un archivo `netlify.toml` que configura automáticamente la variable de entorno. Si prefieres no configurar manualmente, Netlify debería leer este archivo automáticamente en el próximo deploy.

## 📞 Soporte

Si después de seguir estos pasos aún tienes problemas:
- Verifica que el backend esté activo en: https://back-aluen-ohbk.onrender.com
- Revisa la consola del navegador (F12) para más detalles del error

