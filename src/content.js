(async () => {
    const utils = {
        npmUrlBase: "https://www.npmjs.org/package/",
        isPackageJsonFile: () => {
            const title = utils.getPageTitle();

            return title?.textContent === "package.json";
        },
        replaceModules: () => {
            if (utils.isPackageJsonFile()) {
                utils.replaceDependencies();
                return true;
            }
            return false;
        },
        addLinksEnablerButton: () => {
            const btn = document.createElement("button");
            btn.classList.add(
                "btn",
                "btn-sm",
                "BtnGroup-item",
                "file-clipboard-button",
                "tooltipped",
                "tooltipped-s"
            );
            btn.setAttribute("type", "button");
            btn.ariaLabel = "Enable npm links";
            btn.innerText = "Links";
            btn.onclick = utils.replaceModules;

            const btnGroup = document.querySelectorAll(
                ".BtnGroup:not(.d-md-none)"
            )[1];

            btnGroup.appendChild(btn);
        },
        replaceModulesWithLinks: async (elements) => {
            for (let i = 0, len = elements.length; i < len; i++) {
                const el = elements[i];
                const packageName = el.packageName.textContent;
                const version = el.version.textContent;
                const a = utils.createHyperLink(packageName, version);
                el.packageName.innerHTML = "";
                el.packageName.appendChild(a);
            }
        },
        getDependencyElements: (entity) => {
            const lines = utils.getLines();
            const elements = [];
            let insideScope = false;

            for (let i = 0, len = lines.length; i < len; i++) {
                const line = lines[i];
                if (!line) continue;

                if (
                    utils.isStartDependencyNode(line, entity) &&
                    !utils.isEmptyDependencyNode(line)
                ) {
                    insideScope = true;
                    continue;
                }

                if (!insideScope) continue;

                if (utils.isEndDependencyNode(line)) {
                    return elements;
                }

                const child = line.querySelector(".pl-s");
                const packageName = line.querySelector(".pl-ent");
                if (child) {
                    elements.push({ version: child, packageName });
                }
            }

            return [];
        },
        replaceDependencies: () => {
            const packages = utils.getDependencyElements("dependencies");
            utils.replaceModulesWithLinks(packages);

            const devPackages = utils.getDependencyElements("devDependencies");
            utils.replaceModulesWithLinks(devPackages);

            const optionalPackages = utils.getDependencyElements(
                "optionalDependencies"
            );
            utils.replaceModulesWithLinks(optionalPackages);

            const peerPackages =
                utils.getDependencyElements("peerDependencies");
            utils.replaceModulesWithLinks(peerPackages);

            const bundledPackages = utils.getDependencyElements(
                "bundledDependencies"
            );
            utils.replaceModulesWithLinks(bundledPackages);

            const nameField = utils.getNameField();

            if (nameField) {
                utils.replaceModulesWithLinks([nameField]);
            }
        },
        getLines: () => {
            return document.querySelectorAll(".js-file-line");
        },
        getPageTitle: () => {
            return document.querySelector(".final-path");
        },
        getNameField: () => {
            const pls = document.querySelectorAll(".pl-ent");
            for (let i = 0, len = pls.length; i < len; i++) {
                const pl = pls[i];
                if (pl.innerText.includes("name")) {
                    return pl.parentNode.querySelectorAll(".pl-ent")[1];
                }
            }
            return void 0;
        },
        createHyperLink: (packageName, version) => {
            const quote = version.includes("'") ? "'" : '"';
            const a = document.createElement("a");
            version = version.replace(/("|'|\^|~)/g, "");
            packageName = packageName.replace(/("|')/g, "");
            a.href = `${utils.npmUrlBase + packageName}/v/${version}`;
            a.innerText = quote + packageName + quote;
            a.setAttribute("target", "_blank");
            a.title = `Visit NPM Module site for ${packageName}`;
            return a;
        },

        isEmptyDependencyNode: ({ innerText }) => {
            return innerText.match(/\{\s*\}/);
        },

        isStartDependencyNode: (node, name) => {
            const pl = node.querySelector(".pl-ent");
            if (!pl) return false;

            return pl.innerText.includes(name);
        },

        isEndDependencyNode: ({ innerText }) => {
            return innerText.includes("}");
        },

        initialize: () => {
            //console.log("initialize github enhancer...");

            utils.addLinksEnablerButton();

            document.body.addEventListener(
                "click",
                (event) => {
                    if (!event.target.classList.contains("js-file-line")) {
                        return;
                    }
                    utils.replaceModules();
                },
                false
            );

            // observe changes in URL to look for package.json and enable links
            let previousUrl = "";
            const observer = new MutationObserver(function (mutations) {
                if (location.href !== previousUrl) {
                    previousUrl = location.href;
                    // console.log(`URL changed to ${location.href}`);
                    if (location.href.includes("package.json")) {
                        // console.log("package.json found in url");
                        // wait for the page to load
                        setTimeout(() => {
                            utils.replaceModules();
                        }, 3000);
                    }
                }
            });
            const config = { subtree: true, childList: true };
            observer.observe(document, config);
        },
    };

    utils.initialize();
})();
