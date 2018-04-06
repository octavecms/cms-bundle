<?php

namespace VideInfra\CMSBundle\Model;

use Knp\DoctrineBehaviors\Model as ORMBehaviors;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaImage
{
    use ORMBehaviors\Translatable\Translatable;

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