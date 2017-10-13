const { beforeEach, it, expect } = global
const fs = require("fs")
const path = require("path")
const tmp = require("tmp")
const yaml = require("node-yaml")
const Compose = require("../../lib/compose")

tmp.setGracefulCleanup()

describe('Compose', () => {
  let t; beforeEach(() => t = {})

  describe('.fromYAML', () => {
    describe('when called with a path to some YAML', () => {
      beforeEach(() => {
        const dirName = tmp.dirSync().name
        const filename = path.join(dirName, 'docker-compose.yml')

        fs.writeFileSync(filename, `
          networks:
            bar:
          services:
            foo:
          volumes:
            bacon:
        `)
        t.sut = Compose.fromYAMLFileSync(filename)
      })

      it('should generate a compose instance', () => {
        expect(t.sut).to.exist
      })
    })

    describe('when given a path to an invalid YAML file', () => {
      it('should throw', () => {
        const dirName = tmp.dirSync().name
        const filename = path.join(dirName, 'docker-compose.yml')

        fs.writeFileSync(filename, `
          networks:
            bar:
          services: a b c
            foo:
          volumes:
            bacon:
        `)
        expect(() => Compose.fromYAMLFileSync(filename)).to.throw()
      })
    })

    describe('when given an path to an invalid YAML file', () => {
      it('should throw', () => {
        const dirName = tmp.dirSync().name
        const filename = path.join(dirName, 'docker-compose.yml')

        fs.writeFileSync(filename, `
          networks:
            bar:
          services: a b c
            foo:
          volumes:
            bacon:
        `)
        expect(() => Compose.fromYAML(yaml)).to.throw()
      })
    })

    describe('when given an invalidpath to a file', () => {
      it('should throw', () => {
        const filename = tmp.tmpNameSync()

        expect(() => Compose.fromYAML(filename)).to.throw()
      })
    })
  })

  describe('->toYAMLFile', () => {
    describe('with no dependencies', () => {
      beforeEach(() => {
        t.dirName = tmp.dirSync().name

        t.sut = new Compose({
          filePath: path.join(t.dirName, 'docker-compose.yml'),
          data: {
            services: {
              foo: {},
            },
          },
        })
      })

      it('should generate some yaml', () => {
        const filename = path.join(t.dirName, 'output.yml')
        t.sut.toYAMLFileSync(filename)
        expect(yaml.readSync(filename)).to.deep.equal({
          services: {
            foo: {},
          },
        })
      })
    })

    describe('with dependencies', () => {
      beforeEach(() => {
        t.dirName = tmp.dirSync().name
        const filename = path.join(t.dirName, 'other-compose.yml')

        fs.writeFileSync(filename, `
          networks:
            bar:
          services:
            foo:
          volumes:
            bacon:
        `)

        t.sut = new Compose({
          filePath: path.join(t.dirName, 'docker-compose.yml'),
          data: {
            volumes: {
              dependencies: {
                labels:  ['./other-compose.yml'],
              },
            },
          },
        })
      })

      it('should generate some yaml', () => {
        const filename = path.join(t.dirName, 'output.yml')
        t.sut.toYAMLFileSync(filename)
        expect(yaml.readSync(filename)).to.deep.equal({
          networks: {
            bar: null,
          },
          services: {
            foo: null,
          },
          volumes: {
            bacon: null,
          },
        })
      })
    })

    describe('with dependencies with conflicts', () => {
      beforeEach(() => {
        t.dirName = tmp.dirSync().name
        const filename = path.join(t.dirName, 'other-compose.yml')

        fs.writeFileSync(filename, `
          networks:
            bar:
          services:
            foo:
          volumes:
            bacon:
        `)

        t.sut = new Compose({
          filePath: path.join(t.dirName, 'docker-compose.yml'),
          data: {
            services: {
              foo: null
            },
            volumes: {
              dependencies: {
                labels:  ['./other-compose.yml'],
              },
            },
          },
        })
      })

      it('should throw an error', () => {
        const filename = path.join(t.dirName, 'output.yml')
        expect(() => t.sut.toYAMLFileSync(filename)).to.throw()
      })
    })

    describe('with recursive dependencies', () => {
      beforeEach(() => {
        t.dirName = tmp.dirSync().name
        const otherFilename = path.join(t.dirName, 'other-compose.yml')
        const otherOtherFilename = path.join(t.dirName, 'other-other-compose.yml')

        fs.writeFileSync(otherOtherFilename, `
          networks:
            bar:
          services:
            foo:
          volumes:
            bacon:
        `)

        fs.writeFileSync(otherFilename, `
          volumes:
            dependencies:
              labels:
                - './other-other-compose.yml'
        `)

        t.sut = new Compose({
          filePath: path.join(t.dirName, 'docker-compose.yml'),
          data: {
            volumes: {
              dependencies: {
                labels:  ['./other-compose.yml'],
              },
            },
          },
        })
      })

      it('should generate some yaml', () => {
        const filename = path.join(t.dirName, 'output.yml')
        t.sut.toYAMLFileSync(filename)
        expect(yaml.readSync(filename)).to.deep.equal({
          networks: {
            bar: null,
          },
          services: {
            foo: null,
          },
          volumes: {
            bacon: null,
          },
        })
      })
    })

    describe('with recursive dependencies with conflicts', () => {
      beforeEach(() => {
        t.dirName = tmp.dirSync().name
        const otherFilename = path.join(t.dirName, 'other-compose.yml')
        const otherOtherFilename = path.join(t.dirName, 'other-other-compose.yml')

        fs.writeFileSync(otherOtherFilename, `
          networks:
            bar:
          services:
            foo:
          volumes:
            bacon:
        `)

        fs.writeFileSync(otherFilename, `
          volumes:
            dependencies:
              labels:
                - './other-other-compose.yml'
        `)

        t.sut = new Compose({
          filePath: path.join(t.dirName, 'docker-compose.yml'),
          data: {
            services: {
              foo: null,
            },
            volumes: {
              dependencies: {
                labels:  ['./other-compose.yml'],
              },
            },
          },
        })
      })

      it('should throw an error', () => {
        const filename = path.join(t.dirName, 'output.yml')
        expect(() => t.sut.toYAMLFileSync(filename)).to.throw()
      })
    })
  })
})
