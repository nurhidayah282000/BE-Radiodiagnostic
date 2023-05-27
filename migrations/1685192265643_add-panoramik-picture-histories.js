/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("histories", {
    panoramik_picture: {
      type: "text",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("histories", ["panoramik_picture"]);
};
