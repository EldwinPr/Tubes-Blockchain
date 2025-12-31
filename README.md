# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```


## Database Setup

To set up and run the database:

1. Run migrations to create tables:
	```sh
	npx prisma migrate deploy
	```

2. (Optional) Seed the database with initial data:
	```sh
	npx prisma db seed
	```

3. To view and edit the database in a browser UI:
	```sh
	npx prisma studio
	```

## API Documentation

To view the interactive API documentation (Swagger UI):

1. Start the development server:
	```sh
	npm run dev
	```
2. Open your browser and go to:
	```
	http://localhost:5173/docs.html
	```
	This will display the Swagger UI for your API, reading from openapi.yaml.
