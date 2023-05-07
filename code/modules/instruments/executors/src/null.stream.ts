const stream = require ( 'stream' );

export class NullWritable extends stream.Writable {
  constructor () {super ( {} );}

  _write ( chunk, encoding, callback ) {
    callback ();
  }
}

export class NullReadable extends stream.Readable {
  constructor () {super ( {} );}

  _read () {}
}