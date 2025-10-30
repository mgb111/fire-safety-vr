export const GameState = {
  module: 1,
  flags: {
    fireStarted: false,
    alarmActivated: false,
    extinguisherGrabbed: false,
    fireExtinguished: false,
    evacuated: false
  },
  resetFlags(){
    this.flags = { fireStarted:false, alarmActivated:false, extinguisherGrabbed:false, fireExtinguished:false, evacuated:false };
  }
};
