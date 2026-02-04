FROM node:20

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Eliminar node_modules y package-lock si existen
RUN rm -rf node_modules package-lock.json

# Instalar dependencias frescas
RUN npm install

# Reinstalar lightningcss específicamente con binarios nativos
RUN npm rebuild lightningcss

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=development

# Comando para modo desarrollo
CMD ["npm", "run", "dev"]