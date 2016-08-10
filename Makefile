dist:
	rm -rf dist && mkdir dist && \
	./node_modules/.bin/babel src --out-dir dist && \
	cp package.json dist/ && \
	cp Dockerfile dist/ && \
	cp Dockerfile_alpine dist/ \

start:
	./node_modules/.bin/babel-node src/index.js

.PHONY: test build dist start example