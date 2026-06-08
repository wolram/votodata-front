Todo ciclo eleitoral, a mesma cena: alguém da equipe abre um CSV do TSE e os acentos viraram caracteres estranhos. Bem-vindo ao imposto invisível das campanhas.

## O atrito real

- **Encoding Latin-1**, não UTF-8 — acentuação quebra.
- Separadores inconsistentes entre arquivos e anos.
- Volumes que travam o Excel e o paciência da equipe.

O resultado: 40% da semana de gente cara gasto **limpando dado**, não produzindo análise.

## A engenharia que resolve

Construímos a ingestão em **Rust**, com foco em throughput e memória previsível:

- 8 GB de CSV processados em minutos.
- RSS constante abaixo de 256 MB.
- IDs estáveis para análise longitudinal desde 1945.

## Por que isso muda o jogo

Quando o dado entra limpo e normalizado, sua equipe começa o trabalho **onde deveria** começar: na leitura, não na faxina.

A vantagem competitiva não é ter o dado — todo mundo tem, é público. É ter o dado **utilizável primeiro**.