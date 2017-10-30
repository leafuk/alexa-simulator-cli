const gulp = require('gulp');
const typedoc = require('gulp-typedoc');

gulp.task("default", ["typedoc"]);

gulp.task("typedoc", function () {
    gulp.src([
        "src/Device.ts",
        "src/SkillContext.ts",
        "src/SkillSession.ts",
        "src/User.ts",
        "src/VirtualAlexa.ts",
    ]).pipe(typedoc({
            // TypeScript options (see typescript docs)
            excludePrivate: true,
            excludeNotExported: true,
            excludeExternals: true,
            mode: "file",
            name: "Alexa Simulator",
            readme: "README.md",
            target: "ES6",
            out: "docs/api",
            version: true
        })
    );
});
