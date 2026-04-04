export default function () {
  return {
    name: 'module-remover',

    visitor: {
      ImportDeclaration (
        path
      ) {
        path.remove()
      },
      ExportNamedDeclaration (
        path
      ) {
        const { declaration, specifiers } = path.node
        if (declaration) {
          path.replaceWith(declaration)
        } else if (specifiers.length > 0) {
          path.remove()
        }
      },
      ExportDefaultDeclaration (
        path
      ) {
        const { declaration } = path.node
        path.replaceWith(declaration)
      }
    },
  }
}
