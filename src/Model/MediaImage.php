<?php

namespace Octave\CMSBundle\Model;

use Knp\DoctrineBehaviors\Contract\Entity\TranslatableInterface;
use Knp\DoctrineBehaviors\Model as ORMBehaviors;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class MediaImage implements TranslatableInterface
{
    use ORMBehaviors\Translatable\TranslatableTrait;

    /** @var string */
    private $image;

    /**
     * @return string
     */
    public function getImage()
    {
        return $this->image;
    }

    /**
     * @param string $image
     */
    public function setImage($image)
    {
        $this->image = $image;
    }
}