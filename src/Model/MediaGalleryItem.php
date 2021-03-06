<?php

namespace Octave\CMSBundle\Model;

use Knp\DoctrineBehaviors\Contract\Entity\TranslatableInterface;
use Knp\DoctrineBehaviors\Model as ORMBehaviors;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class MediaGalleryItem implements TranslatableInterface
{
    use ORMBehaviors\Translatable\TranslatableTrait;

    /** @var string */
    private $image;

    /** @var int */
    private $galleryorder;

    /**
     * @return mixed
     */
    public function getImage()
    {
        return $this->image;
    }

    /**
     * @param mixed $image
     */
    public function setImage($image)
    {
        $this->image = $image;
    }

    /**
     * @return mixed
     */
    public function getGalleryorder()
    {
        return $this->galleryorder;
    }

    /**
     * @param mixed $galleryorder
     */
    public function setGalleryorder($galleryorder)
    {
        $this->galleryorder = $galleryorder;
    }


}