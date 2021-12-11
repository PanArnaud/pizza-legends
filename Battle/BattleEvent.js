class BattleEvent {
  constructor(event, battle) {
    this.event = event;
    this.battle = battle;
  }

  textMessage(resolve) {
    const text = this.event.text
      .replace("{CASTER}", this.event.caster?.name)
      .replace("{TARGET}", this.event.target?.name)
      .replace("{ACTION}", this.event.action?.name);

    const message = new TextMessage({
      text,
      onComplete: () => {
        resolve();
      }
    });
    message.init(this.battle.element);
  }

  submissionMenu(resolve) {
    const { caster } = this.event;
    const menu = new SubmissionMenu({
      caster,
      enemy: this.event.enemy,
      items: this.battle.items,
      replacements: Object.values(this.battle.combatants).filter(c => {
        return c.id !== caster.id && c.team === caster.team && c.hp > 0;
      }),
      onComplete: submission => {
        resolve(submission);
      },
    });
    menu.init(this.battle.element);
  }

  async replace (resolve) {
    const { replacement } = this.event;

    // Clear out the old combatant
    const prevCombatant = this.battle.combatants[this.battle.activeCombatants[replacement.team]];
    this.battle.activeCombatants[replacement.team] = null;
    prevCombatant.update();
    await utils.wait(400);

    // In with the new
    this.battle.activeCombatants[replacement.team] = replacement.id;
    replacement.update();
    await utils.wait(400);

    resolve();
  }

  replacementMenu(resolve) {
    const menu = new ReplacementMenu({
      replacements: Object.values(this.battle.combatants).filter(c => {
        return c.team === this.event.team && c.hp > 0;
      }),
      onComplete: replacement => {
        resolve(replacement);
      }
    });
    menu.init(this.battle.element);
  }

  animation(resolve) {
    const fn = BattleAnimations[this.event.animation];
    fn(this.event, resolve);
  }

  async stateChange(resolve) {
    const { action, caster, target, damage, recover, status } = this.event;
    let who = this.event.onCaster ? caster : target;
    if (damage) {
      // Modify the target to have less hp
      target.update({
        hp: target.hp - damage
      });

      // start blinking
      target.pizzaElement.classList.add("battle-damage-blink");
    }

    if (recover) {
      let newHp = who.hp + recover;
      if (newHp > who.maxHp) {
        newHp = who.maxHp;
      }
      who.update({
        hp: newHp
      });
    }
    if (status) {
      who.update({
        status: { ...status }
      });
    }
    if (status === null) {
      who.update({
        status: null
      });
    }
    
    // wait a little bit
    await utils.wait(600);
    // stop blinking
    target.pizzaElement.classList.remove("battle-damage-blink");

    resolve();
  }

  init(resolve) {
    this[this.event.type](resolve);
  }
}
