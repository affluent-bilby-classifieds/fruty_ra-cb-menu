Please note: Although I am a seasoned tech guy I am quite a novice as a developer. If you experience issues with this project please try the original at: https://github.com/francoisruty/fruty_react-admin
In fact, there is currently an issue with the docker-compose.yml file for this particular fork so it won't build. I plan to fix this soon.

I have tried to automate the building of the docker containers by adding .sh scripts and hooks to the docker-compose.yml file. 

Next I will try to add a json field to postgres and allow the contents to be edited. This will be a menu for a real-life burger restaurant.

This project uses [ra-data-simple-rest](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-simple-rest) for the data privider. That wasn't obvious to me at first. You will find the source code in the readme is very similar to the code used here.

The back-end uses [Express](https://github.com/auth0/express), [Express-jwt](https://github.com/auth0/express-jwt) and [express-jwt-authz](https://github.com/auth0/express-jwt-authz)



Blog post: https://fruty.io/2020/01/15/building-business-apps-with-react-admin/


### Procedure

The first step is to 'git clone' the repo.

In this case:

```
git clone https://github.com/affluent-bilby-classifieds/fruty_ra-cb-menu.git
```

change to the directory:

```
cd fruty_ra-cb-menu
```


You may need to add execute permission to build.sh

```
chmod +x build.sh
```
In the next part we load the docker-compose.yml file to build our containers.

```
docker-compose up -d
```

Install dependencies for front and back:

```
docker-compose run front /bin/sh
```
```
docker-compose run back /bin/sh
```
Start-docker containers again:

```
docker-compose up -d
```
Create a new user:

```
curl -X POST http://localhost:3000/api/create_user -H 'Cache-Control: no-cache' -H 'Content-Type: application/json' -d '{ "email": "test@test.fr", "password": "Password1" }'
```

You should get:
{"result":"user created."}




All containers should now be up, and you can go to http://localhost:3000 in your browser.

Import the json table for the menu:

```
docker-compose exec postgres /bin/bash
```
Inside the container now run:






```
psql --username=fruty

```

```
fruty=# create database menudb;
CREATE DATABASE
```

```
fruty=# grant all privileges on database menudb to fruty;
GRANT
```
```
\q
```
now back in bash we enter the following:


```
apt-get update
```
```
apt-get install jq
```
```
cd init/json
```

Now we are loading the JSON into a Postgres JSONB column all thanks to the guide from: [(@kiwicopple)](https://dev.to/kiwicopple/loading-json-into-postgres-2l28)

```
cat menuItems.json | jq -cr '.[]' | sed 's/\\[tn]//g' > output.json
```
```
psql -h localhost -p 5432 menudb -U fruty -c "CREATE TABLE menu (data jsonb);"
```

```
cat output.json | psql -h localhost -p 5432 menudb -U fruty -c "COPY menu (data) FROM STDIN;"
```

Now we check the json has been imported to the jsonb table OK.

```
psql --username=fruty

```


```
fruty=# \l
                             List of databases
   Name    | Owner | Encoding |  Collate   |   Ctype    | Access privileges 
-----------+-------+----------+------------+------------+-------------------
 fruty     | fruty | UTF8     | en_US.utf8 | en_US.utf8 | 
 menudb    | fruty | UTF8     | en_US.utf8 | en_US.utf8 | 
 template0 | fruty | UTF8     | en_US.utf8 | en_US.utf8 | =c/fruty         +
           |       |          |            |            | fruty=CTc/fruty
 template1 | fruty | UTF8     | en_US.utf8 | en_US.utf8 | =c/fruty         +
           |       |          |            |            | fruty=CTc/fruty
(4 rows)

```

```
fruty=# \c menudb
You are now connected to database "postgres" as user "fruty".
menudb=# \dt
       List of relations
 Schema | Name | Type  | Owner 
--------+------+-------+-------
 public | menu | table | fruty
(1 row)
```

```
menudb=# SELECT * FROM menu;
                                                                                                                                           data                            
                                                                                                               
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------
 {"id": 1, "img": "./images/item-1.jpeg", "desc": "AW Rootbear with a scoop of delicious icecream.", "price": "7.5", "title": "Compton rootbeer", "category": "Drinks"}
 {"id": 2, "img": "./images/item-2.jpeg", "desc": "Chickpea Pattie, Avocardo, Lettuce, Tomato, BBQ sauce, onion, Sweet Chilli. Vegan mayo.", "price": 13.99, "title": "Vega
n Paradise", "category": "Burgers"}
 {"id": 3, "img": "./images/item-3.jpeg", "desc": "The sweetest and most delicious Mexican soda. Loved by Gringos. Great with burgers.", "price": 6.99, "title": "Jarritos 
Mexican Soda", "category": "Drinks"}
 ...etc....
(34 rows)

```
Don't forget to quit: 

```
\q
```


if you need to export the database such as to send to a third party provider:

```
pg_dump -d menudb -U fruty -t menu > file.sql
```
then

```
docker cp  fruty_ra-cb-menu_postgres_1:/file.sql .
```

assuminging fruty_ra-cb-menu_postgres_1 is the name of your postgres docker container. 
This copies the sql file to your current directory.

### Verifications

- you should be able to log in with the user you created.

- you should be able to create, edit, and delete items.


### Notes

We have just signed up for the [Supabase.io](https://github.com/supabase/supabase) public alpha!

- we use a nginx load-balancer in front of the dev server, so that we can easily route
API calls to the back docker container, without messing with front dev server parameters.

- do NOT use this setup in production! This is a dev environment! For production you would have
to make Dockerfiles for front and back (front Dockerfile would use among other things "npm run build" command), build those docker containers and use them in docker-compose.yml, instead of mapping source code inside containers with docker filesystem mappings + installing manually dependencies.
