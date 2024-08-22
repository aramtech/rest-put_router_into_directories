import path from "path";
import root_paths from "../../dynamic_configuration/root_paths.ts";

const fs = (await import("fs")).default;
const env = (await import("$/server/env.js")).default;

const app_path = root_paths.app_path;

const routers_main_directory = path.join(app_path, "server", "routers");
const router_suffix_regx = RegExp(env.router.router_suffix_regx || "\\.router\\.js$");
const description_suffix_regx = RegExp(env.router.description_suffix_regx || "\\.description\\.[a-zA-Z]{1,10}$");

const move_into_folders = function (directory = routers_main_directory) {
    const content = fs.readdirSync(directory);
    for (const item of content) {
        const item_absolute_path = path.join(directory, item);
        const item_stat = fs.statSync(item_absolute_path);
        if (item_stat.isDirectory()) {
            move_into_folders(item_absolute_path);
        } else {
            const router_match = item.match(router_suffix_regx);
            if (!!router_match) {
                const router_name = item.slice(0, item.indexOf(router_match[0]));
                if (router_name != "index") {
                    fs.mkdirSync(path.join(directory, router_name));

                    fs.cpSync(item_absolute_path, path.join(directory, router_name, item.replace(router_name, "index")));
                    fs.rmSync(item_absolute_path);

                    const router_description_regx = RegExp(`${router_name}${description_suffix_regx.toString().slice(1, -1)}`);
                    const router_description_file = content.filter((el) => !!el.match(router_description_regx))[0];
                    if (router_description_file) {
                        fs.cpSync(
                            path.join(directory, router_description_file),
                            path.join(directory, router_name, router_description_file.replace(router_name, "index")),
                        );
                        fs.rmSync(path.join(directory, router_description_file));
                    }
                }
            }
        }
    }
};

move_into_folders();
