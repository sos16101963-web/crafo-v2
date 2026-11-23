export type SequenceId =
  | 'spin'
  | 'crunch'
  | 'layers'
  | 'ganache'
  | 'tempering'
  | 'crunch_passion'
  | 'crunch_pistachio'
  | 'crunch_truffle'
;

export const DESKTOP_COUNTS: Record<SequenceId, number> = {
  spin: 100,
  crunch: 91,
  layers: 86,
  ganache: 100,
  tempering: 99,
  crunch_passion: 93,
  crunch_pistachio: 93,
  crunch_truffle: 92,
};

export const MOBILE_COUNTS: Record<SequenceId, number> = {
  spin: 65,
  crunch: 60,
  layers: 57,
  ganache: 65,
  tempering: 64,
  crunch_passion: 62,
  crunch_pistachio: 62,
  crunch_truffle: 61,
};
