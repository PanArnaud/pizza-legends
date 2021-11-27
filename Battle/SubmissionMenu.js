class SubmissionMenu {
  constructor({ caster, enemy, onComplete }) {
    this.caster = caster;
    this.enemy = enemy;
    this.onComplete = onComplete;
  }

  device() {
    this.onComplete({
      action: Actions[this.caster.actions[0]],
      target: this.enemy
    });
  }

  init(container) {
    this.device();
  }
}