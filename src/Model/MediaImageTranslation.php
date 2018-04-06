<?php

namespace VideInfra\CMSBundle\Model;

use Knp\DoctrineBehaviors\Model as ORMBehaviors;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaImageTranslation
{
    use ORMBehaviors\Translatable\Translation;

    /** @var string */
    private $title;

    /**
     * @return mixed
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @param mixed $title
     */
    public function setTitle($title)
    {
        $this->title = $title;
    }
}