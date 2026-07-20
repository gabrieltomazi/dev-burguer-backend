import app from './app';
import './database/prisma';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server rodando na porta ${PORT}`);
});
