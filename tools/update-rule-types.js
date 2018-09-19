/**
 * JSCodeShift script to update meta.type in rules.
 * Run over the rules directory only. Use this command:
 * 
 *   jscodeshift -t tools/update-rule-types.js lib/rules/
 * 
 * @author Nicholas C. Zakas
 */
"use strict";

module.exports = (fileInfo, api) => {
    const j = api.jscodeshift;
    const source = fileInfo.source;

    const nodes = j(source).find(j.ObjectExpression).filter((p) => {
        return p.node.properties.some(node => node.key.name === "meta");
    });

    return nodes.replaceWith((p) => {
        const metaNode = p.node.properties.find(node => node.key.name === "meta");
        const typeNode = metaNode.value.properties.find(node => node.key.name === "type");
        const docsNode = metaNode.value.properties.find(node => node.key.name === "docs");
        const categoryNode = docsNode.value.properties.find(node => node.key.name === "category").value;
        
        let ruleType;

        switch (categoryNode.value) {
            case "Stylistic Issues":
                ruleType = "style";
                break;

            case "Possible Errors":
                ruleType = "problem";
                break;

            default:
                ruleType = "suggestion";
        }

        if (typeNode) {
            console.log("Type already there."); 
        } else {
            const newProp = j.property(
                "init",
                j.identifier("type"),
                j.literal(ruleType)
            );
            p.node.properties[0].value.properties.unshift(newProp);
        }

        return p.node;
    }).toSource();
};