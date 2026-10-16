/** Row in `motion_bank.tags`. Linked from motions through `motion_tags.tag_id`. */
export type Tag = {
  id: string;
  name: string;
};

export type TagRow = {
  id: string;
  name: string;
};

/** Join row in `motion_bank.motion_tags`. */
export type MotionTag = {
  motionId: string;
  tagId: string;
};

export type MotionTagRow = {
  motion_id: string;
  tag_id: string;
};
