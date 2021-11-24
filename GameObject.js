class GameObject {
  constructor(config) {
    this.id = null;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.direction = config.direction || "down";
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src || "/images/characters/people/hero.png"
    });

    this.behaviourLoop = config.behaviourLoop || [];
    this.behaviourLoopIndex = 0;
  }

  mount(map) {
    this.isMounted = true;
    map.addWall(this.x, this.y);

    // If we have a behaviour, kick off after a short delay
    setTimeout(() => {
      this.doBehaviourEvent(map)
    }, 10)
  }

  update() {

  }

  async doBehaviourEvent(map) {
    // Don't do anything if there a more important cutscene or I don't have config to do anything
    if (map.isCutscenePlaying || this.behaviourLoop.length === 0) {
      return;
    }

    // Settings up our event with relevant info
    let eventConfig = this.behaviourLoop[this.behaviourLoopIndex];
    eventConfig.who = this.id;
  
    // Create an envent instance out of our next event config
    const eventHandler = new OverworldEvent({ map, event: eventConfig });
    await eventHandler.init();

    // Setting the next event to fire
    this.behaviourLoopIndex += 1;
    if (this.behaviourLoopIndex === this.behaviourLoop.length) {
      this.behaviourLoopIndex = 0;
    }

    // Repeat
    this.doBehaviourEvent(map);
  }
}